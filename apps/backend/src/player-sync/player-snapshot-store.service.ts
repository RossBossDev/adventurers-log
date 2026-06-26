import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Kysely, Selectable, Transaction } from "kysely";
import { KYSELY_DB } from "../database/database.tokens";
import type { DB, Json, PlayerSnapshots } from "../database/database.types";
import { diffCanonicalPlayerSnapshots } from "./canonical/canonical-player-snapshot.diff";
import { mergeCanonicalPlayerSnapshot } from "./canonical/canonical-player-snapshot.merge";
import type { CanonicalPlayerSnapshotUpdate } from "./canonical/canonical-player-snapshot.types";
import { parseCanonicalPlayerSnapshot } from "./canonical/canonical-player-snapshot.validate";
import type { IngestionSource } from "./player-sync.types";
import { ProgressEventStoreService } from "./progress-events/progress-event-store.service";

export type RawSnapshotInput = {
  trackedPlayerId: string;
  source: IngestionSource;
  sourceUsername: string;
  fetchedAt: Date;
  httpStatus: number | null;
  cached: boolean | null;
  rawPayload: Json;
};

export type StoreCanonicalSnapshotResult = {
  rawPlayerSnapshotId: string;
  previousPlayerSnapshotId: string | null;
  currentPlayerSnapshotId: string | null;
  changed: boolean;
  eventsGenerated: number;
  eventsInserted: number;
};

@Injectable()
export class PlayerSnapshotStoreService {
  private readonly logger = new Logger(PlayerSnapshotStoreService.name);

  constructor(
    @Inject(KYSELY_DB) private readonly db: Kysely<DB>,
    @Inject(ProgressEventStoreService)
    private readonly progressEvents: ProgressEventStoreService,
  ) {}

  async storeSnapshot(
    rawInput: RawSnapshotInput,
    canonicalUpdate: CanonicalPlayerSnapshotUpdate,
  ): Promise<StoreCanonicalSnapshotResult> {
    return this.db.transaction().execute(async (trx) => {
      await trx
        .selectFrom("tracked_players")
        .select("id")
        .where("id", "=", rawInput.trackedPlayerId)
        .forUpdate()
        .executeTakeFirstOrThrow();

      const rawSnapshot = await trx
        .insertInto("raw_player_snapshots")
        .values({
          tracked_player_id: rawInput.trackedPlayerId,
          source: rawInput.source,
          source_username: rawInput.sourceUsername,
          fetched_at: rawInput.fetchedAt,
          http_status: rawInput.httpStatus,
          cached: rawInput.cached,
          raw_payload: rawInput.rawPayload,
        })
        .returning(["id"])
        .executeTakeFirstOrThrow();

      const previous = await this.findLatestCanonicalSnapshot(
        trx,
        rawInput.trackedPlayerId,
      );
      const previousSnapshot = previous
        ? parseCanonicalPlayerSnapshot(previous.normalized)
        : null;
      const previousSnapshotId = previousSnapshot
        ? (previous?.id ?? null)
        : null;

      if (previous && !previousSnapshot) {
        this.logger.warn(
          `Ignoring non-canonical previous snapshot ${previous.id} for tracked player ${rawInput.trackedPlayerId}; starting a new canonical baseline.`,
        );
      }

      const mergeResult = mergeCanonicalPlayerSnapshot(
        previousSnapshot,
        canonicalUpdate,
      );

      if (!mergeResult.changed) {
        this.logger.log(
          `Stored ${rawInput.source} raw snapshot ${rawSnapshot.id}; canonical snapshot unchanged for tracked player ${rawInput.trackedPlayerId}.`,
        );

        return {
          rawPlayerSnapshotId: rawSnapshot.id,
          previousPlayerSnapshotId: previousSnapshotId,
          currentPlayerSnapshotId: previousSnapshotId,
          changed: false,
          eventsGenerated: 0,
          eventsInserted: 0,
        };
      }

      const current = await trx
        .insertInto("player_snapshots")
        .values({
          tracked_player_id: rawInput.trackedPlayerId,
          raw_player_snapshot_id: rawSnapshot.id,
          source: rawInput.source,
          fetched_at: rawInput.fetchedAt,
          normalized: mergeResult.snapshot as Json,
        })
        .returning(["id"])
        .executeTakeFirstOrThrow();

      const events = diffCanonicalPlayerSnapshots({
        trackedPlayerId: rawInput.trackedPlayerId,
        previousSnapshotId,
        currentSnapshotId: current.id,
        previous: previousSnapshot,
        current: mergeResult.snapshot,
        occurredAt: rawInput.fetchedAt,
      });
      const eventsInserted = await this.progressEvents.insertEventsWithDb(
        trx,
        events,
      );

      this.logger.log(
        `Stored ${rawInput.source} raw snapshot ${rawSnapshot.id}, canonical snapshot ${current.id}, and ${eventsInserted}/${events.length} progress events for tracked player ${rawInput.trackedPlayerId}.`,
      );

      return {
        rawPlayerSnapshotId: rawSnapshot.id,
        previousPlayerSnapshotId: previousSnapshotId,
        currentPlayerSnapshotId: current.id,
        changed: true,
        eventsGenerated: events.length,
        eventsInserted,
      };
    });
  }

  private async findLatestCanonicalSnapshot(
    db: Kysely<DB> | Transaction<DB>,
    trackedPlayerId: string,
  ): Promise<Selectable<PlayerSnapshots> | undefined> {
    return db
      .selectFrom("player_snapshots")
      .selectAll()
      .where("tracked_player_id", "=", trackedPlayerId)
      .orderBy("created_at", "desc")
      .orderBy("fetched_at", "desc")
      .executeTakeFirst();
  }
}
