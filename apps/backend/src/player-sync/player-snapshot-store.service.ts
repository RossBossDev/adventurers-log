import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Kysely } from "kysely";
import { KYSELY_DB } from "../database/database.tokens";
import type { DB, Json } from "../database/database.types";
import type { IngestionSource } from "./player-sync.types";

export type RawSnapshotInput = {
  trackedPlayerId: string;
  source: IngestionSource;
  sourceUsername: string;
  fetchedAt: Date;
  httpStatus: number | null;
  cached: boolean | null;
  rawPayload: Json;
};

export type NormalizedSnapshotInput = {
  trackedPlayerId: string;
  rawPlayerSnapshotId: string;
  source: IngestionSource;
  fetchedAt: Date;
  normalized: Json;
};

@Injectable()
export class PlayerSnapshotStoreService {
  private readonly logger = new Logger(PlayerSnapshotStoreService.name);

  constructor(@Inject(KYSELY_DB) private readonly db: Kysely<DB>) {}

  async storeSnapshot(
    rawInput: RawSnapshotInput,
    normalized: Json,
  ): Promise<void> {
    const rawSnapshot = await this.db
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

    await this.storeNormalizedSnapshot({
      trackedPlayerId: rawInput.trackedPlayerId,
      rawPlayerSnapshotId: rawSnapshot.id,
      source: rawInput.source,
      fetchedAt: rawInput.fetchedAt,
      normalized,
    });

    this.logger.log(
      `Stored ${rawInput.source} raw snapshot ${rawSnapshot.id} and normalized snapshot for tracked player ${rawInput.trackedPlayerId}.`,
    );
  }

  private async storeNormalizedSnapshot(
    input: NormalizedSnapshotInput,
  ): Promise<void> {
    await this.db
      .insertInto("player_snapshots")
      .values({
        tracked_player_id: input.trackedPlayerId,
        raw_player_snapshot_id: input.rawPlayerSnapshotId,
        source: input.source,
        fetched_at: input.fetchedAt,
        normalized: input.normalized,
      })
      .execute();
  }
}
