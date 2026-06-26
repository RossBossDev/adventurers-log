import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Job } from "bullmq";
import type { Kysely } from "kysely";
import { KYSELY_DB } from "../database/database.tokens";
import type { DB, Json } from "../database/database.types";
import { TrackedPlayersService } from "../tracked-players/tracked-players.service";
import {
  PLAYER_SYNC_QUEUE,
  type PlayerSnapshotProvider,
  type SyncPlayerSnapshotJob,
  WIKISYNC_SOURCE,
} from "./player-sync.types";
import { WikiSyncProvider } from "./wikisync.provider";
import { normalizeWikiSyncPlayerSnapshot } from "./wikisync-snapshot.mapper";

@Injectable()
@Processor(PLAYER_SYNC_QUEUE)
export class PlayerSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(PlayerSyncProcessor.name);

  constructor(
    @Inject(TrackedPlayersService)
    private readonly trackedPlayers: TrackedPlayersService,
    @Inject(WikiSyncProvider)
    private readonly wikiSyncProvider: WikiSyncProvider,
    @Inject(KYSELY_DB) private readonly db: Kysely<DB>,
  ) {
    super();
  }

  async process(job: Job<SyncPlayerSnapshotJob>): Promise<void> {
    this.logger.log(
      `Starting player sync job ${job.id ?? "unknown"} for tracked player ${job.data.trackedPlayerId} from ${job.data.source}.`,
    );

    if (job.data.source !== WIKISYNC_SOURCE) {
      throw new Error(`Unsupported player sync source: ${job.data.source}`);
    }

    await this.syncWithProvider(
      job.data.trackedPlayerId,
      this.wikiSyncProvider,
    );

    this.logger.log(
      `Completed player sync job ${job.id ?? "unknown"} for tracked player ${job.data.trackedPlayerId}.`,
    );
  }

  private async syncWithProvider(
    trackedPlayerId: string,
    provider: PlayerSnapshotProvider,
  ): Promise<void> {
    const trackedPlayer = await this.trackedPlayers.findById(trackedPlayerId);

    if (!trackedPlayer) {
      throw new NotFoundException("Tracked player not found.");
    }

    const providerResult = await provider.fetchPlayer(
      trackedPlayer.normalized_username,
    );
    this.logger.log(
      `Fetched ${providerResult.source} snapshot for ${providerResult.sourceUsername}; cached=${providerResult.cached ?? "unknown"}.`,
    );

    const rawSnapshot = await this.db
      .insertInto("raw_player_snapshots")
      .values({
        tracked_player_id: trackedPlayer.id,
        source: providerResult.source,
        source_username: providerResult.sourceUsername,
        fetched_at: providerResult.fetchedAt,
        http_status: providerResult.httpStatus,
        cached: providerResult.cached,
        raw_payload: providerResult.rawPayload,
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();

    const normalized = normalizeWikiSyncPlayerSnapshot(
      providerResult.playerPayload,
    );

    this.logger.log(
      `Stored raw player snapshot ${rawSnapshot.id} for tracked player ${trackedPlayer.id}.`,
    );

    await this.db
      .insertInto("player_snapshots")
      .values({
        tracked_player_id: trackedPlayer.id,
        raw_player_snapshot_id: rawSnapshot.id,
        source: providerResult.source,
        fetched_at: providerResult.fetchedAt,
        normalized: normalized as Json,
      })
      .execute();

    this.logger.log(
      `Stored normalized ${provider.source} snapshot for tracked player ${trackedPlayer.id}.`,
    );
  }
}
