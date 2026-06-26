import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { TrackedPlayersController } from "./tracked-players.controller";
import { TrackedPlayersService } from "./tracked-players.service";

@Module({
  imports: [DatabaseModule],
  controllers: [TrackedPlayersController],
  providers: [TrackedPlayersService],
  exports: [TrackedPlayersService],
})
export class TrackedPlayersModule {}
