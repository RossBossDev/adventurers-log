import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
} from "@nestjs/common";
import { ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import {
  InvalidOsrsUsernameError,
  UntrackableOsrsUsernameError,
} from "./osrs-username";
import {
  type TrackedPlayer,
  TrackedPlayersService,
} from "./tracked-players.service";

@ApiTags("players")
@Controller("player")
export class TrackedPlayersController {
  constructor(
    @Inject(TrackedPlayersService)
    private readonly trackedPlayers: TrackedPlayersService,
  ) {}

  @Get("name/:userName")
  @AllowAnonymous()
  @ApiParam({ name: "userName", description: "Raw OSRS username." })
  @ApiOkResponse({ description: "The canonical tracked player." })
  async findOrCreate(
    @Param("userName") userName: string,
  ): Promise<TrackedPlayer> {
    try {
      return await this.trackedPlayers.findOrCreateByUsername(userName);
    } catch (error) {
      if (
        error instanceof InvalidOsrsUsernameError ||
        error instanceof UntrackableOsrsUsernameError
      ) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
