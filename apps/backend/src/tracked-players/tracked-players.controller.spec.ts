import { BadRequestException } from "@nestjs/common";

jest.mock("@thallesp/nestjs-better-auth", () => ({
  AllowAnonymous: () => () => undefined,
}));

import { InvalidOsrsUsernameError } from "./osrs-username";
import { TrackedPlayersController } from "./tracked-players.controller";
import type {
  TrackedPlayer,
  TrackedPlayersService,
} from "./tracked-players.service";

describe("TrackedPlayersController", () => {
  it("returns the tracked player for the provided name", async () => {
    const trackedPlayer: TrackedPlayer = {
      id: "tracked-player-1",
      normalized_username: "mad mech",
      created_at: new Date("2026-06-23T00:00:00.000Z"),
      updated_at: new Date("2026-06-23T00:00:00.000Z"),
    };
    const service = {
      findOrCreateByUsername: jest.fn().mockResolvedValue(trackedPlayer),
    } as Pick<TrackedPlayersService, "findOrCreateByUsername">;
    const controller = new TrackedPlayersController(
      service as TrackedPlayersService,
    );

    await expect(controller.findOrCreate("Mad Mech")).resolves.toBe(
      trackedPlayer,
    );
    expect(service.findOrCreateByUsername).toHaveBeenCalledWith("Mad Mech");
  });

  it("maps invalid usernames to bad request responses", async () => {
    const service = {
      findOrCreateByUsername: jest
        .fn()
        .mockRejectedValue(new InvalidOsrsUsernameError("invalid name")),
    } as Pick<TrackedPlayersService, "findOrCreateByUsername">;
    const controller = new TrackedPlayersController(
      service as TrackedPlayersService,
    );

    await expect(controller.findOrCreate("bad!name")).rejects.toThrow(
      BadRequestException,
    );
  });
});
