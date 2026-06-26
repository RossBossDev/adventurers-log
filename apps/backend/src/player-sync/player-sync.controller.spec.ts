jest.mock("@thallesp/nestjs-better-auth", () => ({
  AllowAnonymous: () => () => undefined,
}));

import { PlayerSyncController } from "./player-sync.controller";
import type { PlayerSyncService } from "./player-sync.service";

describe("PlayerSyncController", () => {
  it("returns queued sync metadata", async () => {
    const queued = {
      trackedPlayerId: "tracked-player-1",
      source: "wikisync" as const,
      jobId: "wikisync-tracked-player-1",
      status: "queued" as const,
    };
    const service = {
      enqueueWikiSyncSnapshot: jest.fn().mockResolvedValue(queued),
    } as Pick<PlayerSyncService, "enqueueWikiSyncSnapshot">;
    const controller = new PlayerSyncController(service as PlayerSyncService);

    await expect(controller.enqueueSync("tracked-player-1")).resolves.toBe(
      queued,
    );
    expect(service.enqueueWikiSyncSnapshot).toHaveBeenCalledWith(
      "tracked-player-1",
    );
  });
});
