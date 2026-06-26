import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import type { Job } from "bullmq";
import { CollectionLogSyncService } from "./collection-log-sync.service";
import { HiscoreSyncService } from "./hiscore-sync.service";
import {
  PLAYER_SYNC_QUEUE,
  type SyncPlayerSourcesJob,
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
  onActive(job: Job<SyncPlayerSourcesJob>): void {
    this.logger.log(
      `Player sync job ${job.id ?? "unknown"} became active for tracked player ${job.data.trackedPlayerId}.`,
    );
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<SyncPlayerSourcesJob> | undefined, error: Error): void {
    this.logger.error(
      `Player sync job ${job?.id ?? "unknown"} failed for tracked player ${job?.data.trackedPlayerId ?? "unknown"}: ${error.message}`,
      error.stack,
    );
  }

  async process(job: Job<SyncPlayerSourcesJob>): Promise<void> {
    this.logger.log(
      `Starting all-source player sync job ${job.id ?? "unknown"} for tracked player ${job.data.trackedPlayerId}.`,
    );

    await this.syncSource(job, WIKISYNC_SOURCE, () =>
      this.hiscoreSync.syncWikiSyncSnapshot(job.data.trackedPlayerId),
    );
    await this.syncSource(job, TEMPLEOSRS_COLLECTION_LOG_SOURCE, () =>
      this.collectionLogSync.syncTempleOsrsCollectionLog(
        job.data.trackedPlayerId,
      ),
    );

    this.logger.log(
      `Completed all-source player sync job ${job.id ?? "unknown"} for tracked player ${job.data.trackedPlayerId}.`,
    );
  }

  private async syncSource(
    job: Job<SyncPlayerSourcesJob>,
    source: string,
    sync: () => Promise<void>,
  ): Promise<void> {
    try {
      this.logger.log(
        `Starting ${source} sync for tracked player ${job.data.trackedPlayerId}.`,
      );
      await sync();
      this.logger.log(
        `Completed ${source} sync for tracked player ${job.data.trackedPlayerId}.`,
      );
    } catch (error) {
      const syncError =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `${source} sync failed for tracked player ${job.data.trackedPlayerId}; continuing with remaining sources: ${syncError.message}`,
        syncError.stack,
      );
    }
  }
}
