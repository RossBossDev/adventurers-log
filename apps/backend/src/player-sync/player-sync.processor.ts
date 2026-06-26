import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import type { Job } from "bullmq";
import { CollectionLogSyncService } from "./collection-log-sync.service";
import { HiscoreSyncService } from "./hiscore-sync.service";
import {
  PLAYER_SYNC_QUEUE,
  type SyncPlayerSnapshotJob,
  TEMPLEOSRS_COLLECTION_LOG_SOURCE,
  WIKISYNC_SOURCE,
} from "./player-sync.types";

@Injectable()
@Processor(PLAYER_SYNC_QUEUE)
export class PlayerSyncProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(PlayerSyncProcessor.name);

  constructor(
    @Inject(HiscoreSyncService)
    private readonly hiscoreSync: HiscoreSyncService,
    @Inject(CollectionLogSyncService)
    private readonly collectionLogSync: CollectionLogSyncService,
  ) {
    super();
  }

  onModuleInit(): void {
    this.logger.log("Player sync worker initialized.");
  }

  @OnWorkerEvent("active")
  onActive(job: Job<SyncPlayerSnapshotJob>): void {
    this.logger.log(
      `Player sync job ${job.id ?? "unknown"} became active for tracked player ${job.data.trackedPlayerId} from ${job.data.source}.`,
    );
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<SyncPlayerSnapshotJob> | undefined, error: Error): void {
    this.logger.error(
      `Player sync job ${job?.id ?? "unknown"} failed for tracked player ${job?.data.trackedPlayerId ?? "unknown"} from ${job?.data.source ?? "unknown"}: ${error.message}`,
      error.stack,
    );
  }

  async process(job: Job<SyncPlayerSnapshotJob>): Promise<void> {
    this.logger.log(
      `Starting player sync job ${job.id ?? "unknown"} for tracked player ${job.data.trackedPlayerId} from ${job.data.source}.`,
    );

    switch (job.data.source) {
      case WIKISYNC_SOURCE:
        await this.hiscoreSync.syncWikiSyncSnapshot(job.data.trackedPlayerId);
        break;
      case TEMPLEOSRS_COLLECTION_LOG_SOURCE:
        await this.collectionLogSync.syncTempleOsrsCollectionLog(
          job.data.trackedPlayerId,
        );
        break;
      default:
        throw new Error(`Unsupported player sync source: ${job.data.source}`);
    }

    this.logger.log(
      `Completed player sync job ${job.id ?? "unknown"} for tracked player ${job.data.trackedPlayerId}.`,
    );
  }
}
