import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Queue } from "bullmq";
import { TrackedPlayersService } from "../tracked-players/tracked-players.service";
import {
  PLAYER_SYNC_QUEUE,
  type QueuedPlayerSync,
  SYNC_PLAYER_SNAPSHOT_JOB,
  type SyncPlayerSnapshotJob,
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

  async enqueueWikiSyncSnapshot(
    trackedPlayerId: string,
  ): Promise<QueuedPlayerSync> {
    const trackedPlayer = await this.trackedPlayers.findById(trackedPlayerId);

    if (!trackedPlayer) {
      throw new NotFoundException("Tracked player not found.");
    }

    const jobId = `${WIKISYNC_SOURCE}-${trackedPlayer.id}`;
    this.logger.log(
      `Queueing ${WIKISYNC_SOURCE} sync for tracked player ${trackedPlayer.id}.`,
    );

    const job = await this.playerSyncQueue.add(
      SYNC_PLAYER_SNAPSHOT_JOB,
      { trackedPlayerId: trackedPlayer.id, source: WIKISYNC_SOURCE },
      {
        jobId,
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );

    this.logger.log(
      `Queued ${WIKISYNC_SOURCE} sync job ${job.id ?? jobId} for tracked player ${trackedPlayer.id}.`,
    );

    return {
      trackedPlayerId: trackedPlayer.id,
      source: WIKISYNC_SOURCE,
      jobId: job.id ?? jobId,
      status: "queued",
    };
  }
}
