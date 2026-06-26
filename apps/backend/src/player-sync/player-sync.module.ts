import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { TrackedPlayersModule } from "../tracked-players/tracked-players.module";
import { HiscoreSyncService } from "./hiscore-sync.service";
import { OsrsItemCacheService } from "./items/osrs-item-cache.service";
import { OsrsWikiItemMappingProvider } from "./items/osrs-wiki-item-mapping.provider";
import { PlayerSnapshotStoreService } from "./player-snapshot-store.service";
import { PlayerSyncController } from "./player-sync.controller";
import { PlayerSyncProcessor } from "./player-sync.processor";
import { PlayerSyncService } from "./player-sync.service";
import { PLAYER_SYNC_QUEUE } from "./player-sync.types";
import { ProgressEventStoreService } from "./progress-events/progress-event-store.service";
import { TempleOsrsProvider } from "./sources/templeosrs/templeosrs.provider";
import { WikiSyncProvider } from "./sources/wikisync/wikisync.provider";
import { TempleOsrsSyncService } from "./templeosrs-sync.service";

@Module({
  imports: [
    DatabaseModule,
    TrackedPlayersModule,
    BullModule.registerQueue({ name: PLAYER_SYNC_QUEUE }),
  ],
  controllers: [PlayerSyncController],
  providers: [
    PlayerSyncService,
    PlayerSyncProcessor,
    PlayerSnapshotStoreService,
    ProgressEventStoreService,
    HiscoreSyncService,
    TempleOsrsSyncService,
    WikiSyncProvider,
    TempleOsrsProvider,
    OsrsWikiItemMappingProvider,
    OsrsItemCacheService,
  ],
  exports: [PlayerSyncService],
})
export class PlayerSyncModule {}
