import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Queue } from "bullmq";
import { TrackedPlayersService } from "../tracked-players/tracked-players.service";
import {
  ALL_PLAYER_SYNC_SOURCES,
  PLAYER_SYNC_QUEUE,
  type QueuedPlayerSync,
  type QueuedPlayerSyncBatch,
  SYNC_PLAYER_SOURCES_JOB,
  type SyncPlayerSourcesJob,
} from "./player-sync.types";

@Injectable()
export class PlayerSyncService {
  private readonly logger = new Logger(PlayerSyncService.name);

  constructor(
    @InjectQueue(PLAYER_SYNC_QUEUE)
    private readonly playerSyncQueue: Queue<SyncPlayerSourcesJob>,
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

    const job = await this.enqueuePlayerSourcesSync(trackedPlayer.id);

    return {
      trackedPlayerId: trackedPlayer.id,
      status: "queued",
      jobs: [job],
    };
  }

  private async enqueuePlayerSourcesSync(
    trackedPlayerId: string,
  ): Promise<QueuedPlayerSync> {
    const jobId = `${ALL_PLAYER_SYNC_SOURCES}-${trackedPlayerId}-${Date.now()}`;
    this.logger.log(
      `Queueing all-source sync for tracked player ${trackedPlayerId}.`,
    );

    const job = await this.playerSyncQueue.add(
      SYNC_PLAYER_SOURCES_JOB,
      { trackedPlayerId },
      {
        jobId,
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );

    this.logger.log(
      `Queued all-source sync job ${job.id ?? jobId} for tracked player ${trackedPlayerId}.`,
    );

    return {
      trackedPlayerId,
      source: ALL_PLAYER_SYNC_SOURCES,
      jobId: job.id ?? jobId,
      status: "queued",
    };
  }
}
