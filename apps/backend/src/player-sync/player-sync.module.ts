import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { TrackedPlayersModule } from "../tracked-players/tracked-players.module";
import { PlayerSyncController } from "./player-sync.controller";
import { PlayerSyncProcessor } from "./player-sync.processor";
import { PlayerSyncService } from "./player-sync.service";
import { PLAYER_SYNC_QUEUE } from "./player-sync.types";
import { WikiSyncProvider } from "./wikisync.provider";

@Module({
  imports: [
    DatabaseModule,
    TrackedPlayersModule,
    BullModule.registerQueue({ name: PLAYER_SYNC_QUEUE }),
  ],
  controllers: [PlayerSyncController],
  providers: [PlayerSyncService, PlayerSyncProcessor, WikiSyncProvider],
  exports: [PlayerSyncService],
})
export class PlayerSyncModule {}
