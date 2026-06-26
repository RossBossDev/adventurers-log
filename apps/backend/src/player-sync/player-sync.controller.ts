import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from "@nestjs/common";
import { ApiAcceptedResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { PlayerSyncService } from "./player-sync.service";
import type { QueuedPlayerSync } from "./player-sync.types";

@ApiTags("players")
@Controller("player")
export class PlayerSyncController {
  constructor(
    @Inject(PlayerSyncService) private readonly playerSync: PlayerSyncService,
  ) {}

  @Post(":id/sync")
  @HttpCode(HttpStatus.ACCEPTED)
  @AllowAnonymous()
  @ApiParam({ name: "id", description: "Tracked player id." })
  @ApiAcceptedResponse({ description: "The player sync job was queued." })
  async enqueueSync(@Param("id") id: string): Promise<QueuedPlayerSync> {
    return this.playerSync.enqueueWikiSyncSnapshot(id);
  }
}
