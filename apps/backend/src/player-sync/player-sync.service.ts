import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Queue } from "bullmq";
import { TrackedPlayersService } from "../tracked-players/tracked-players.service";
import {
  PLAYER_SYNC_QUEUE,
  type QueuedPlayerSync,
  type QueuedPlayerSyncBatch,
  SYNC_PLAYER_SNAPSHOT_JOB,
  type SyncPlayerSnapshotJob,
  TEMPLEOSRS_COLLECTION_LOG_SOURCE,
  WIKISYNC_SOURCE,
} from "./player-sync.types";

@Injectable()
export class PlayerSyncService {
  private readonly logger = new Logger(PlayerSyncService.name);

  constructor(
    @InjectQueue(PLAYER_SYNC_QUEUE)
    private readonly playerSyncQueue: Queue<SyncPlayerSnapshotJob>,
    @Inject(TrackedPlayersService)
    private readonly trackedPlayers: TrackedPlayersService,
  ) {}

  async enqueueAllPlayerSyncs(
    trackedPlayerId: string,
  ): Promise<QueuedPlayerSyncBatch> {
    const trackedPlayer = await this.trackedPlayers.findById(trackedPlayerId);

    if (!trackedPlayer) {
      throw new NotFoundException("Tracked player not found.");
    }

    const sources: SyncPlayerSnapshotJob["source"][] = [
      WIKISYNC_SOURCE,
      TEMPLEOSRS_COLLECTION_LOG_SOURCE,
    ];
    const jobs = await Promise.all(
      sources.map((source) => this.enqueueSnapshot(trackedPlayer.id, source)),
    );

    return {
      trackedPlayerId: trackedPlayer.id,
      status: "queued",
      jobs,
    };
  }

  private async enqueueSnapshot(
    trackedPlayerId: string,
    source: SyncPlayerSnapshotJob["source"],
  ): Promise<QueuedPlayerSync> {
    const jobId = `${source}-${trackedPlayerId}-${Date.now()}`;
    this.logger.log(
      `Queueing ${source} sync for tracked player ${trackedPlayerId}.`,
    );

    const job = await this.playerSyncQueue.add(
      SYNC_PLAYER_SNAPSHOT_JOB,
      { trackedPlayerId, source },
      {
        jobId,
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );

    this.logger.log(
      `Queued ${source} sync job ${job.id ?? jobId} for tracked player ${trackedPlayerId}.`,
    );

    return {
      trackedPlayerId,
      source,
      jobId: job.id ?? jobId,
      status: "queued",
    };
  }
}
