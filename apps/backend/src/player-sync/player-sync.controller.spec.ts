jest.mock("@thallesp/nestjs-better-auth", () => ({
  AllowAnonymous: () => () => undefined,
}));

import { PlayerSyncController } from "./player-sync.controller";
import type { PlayerSyncService } from "./player-sync.service";

describe("PlayerSyncController", () => {
  it("returns queued sync metadata for the all-source player sync job", async () => {
    const queued = {
      trackedPlayerId: "tracked-player-1",
      status: "queued" as const,
      jobs: [
        {
          trackedPlayerId: "tracked-player-1",
          source: "all" as const,
          jobId: "all-tracked-player-1",
          status: "queued" as const,
        },
      ],
    };
    const service = {
      enqueueAllPlayerSyncs: jest.fn().mockResolvedValue(queued),
    } as Pick<PlayerSyncService, "enqueueAllPlayerSyncs">;
    const controller = new PlayerSyncController(service as PlayerSyncService);

    await expect(controller.enqueueSync("tracked-player-1")).resolves.toBe(
      queued,
    );
    expect(service.enqueueAllPlayerSyncs).toHaveBeenCalledWith(
      "tracked-player-1",
    );
  });
});
