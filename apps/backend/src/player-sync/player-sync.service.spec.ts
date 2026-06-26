import { NotFoundException } from "@nestjs/common";
import type { Queue } from "bullmq";
import type { TrackedPlayersService } from "../tracked-players/tracked-players.service";
import { PlayerSyncService } from "./player-sync.service";
import type { SyncPlayerSourcesJob } from "./player-sync.types";

describe("PlayerSyncService", () => {
  it("enqueues one sequential all-source player sync job", async () => {
    const queue = {
      add: jest.fn().mockResolvedValueOnce({ id: "all-tracked-player-1" }),
    } as Pick<Queue<SyncPlayerSourcesJob>, "add">;
    const trackedPlayers = {
      findById: jest.fn().mockResolvedValue({ id: "tracked-player-1" }),
    } as Pick<TrackedPlayersService, "findById">;
    const service = new PlayerSyncService(
      queue as Queue<SyncPlayerSourcesJob>,
      trackedPlayers as TrackedPlayersService,
    );

    await expect(
      service.enqueueAllPlayerSyncs("tracked-player-1"),
    ).resolves.toEqual({
      trackedPlayerId: "tracked-player-1",
      status: "queued",
      jobs: [
        {
          trackedPlayerId: "tracked-player-1",
          source: "all",
          jobId: "all-tracked-player-1",
          status: "queued",
        },
      ],
    });
    expect(queue.add).toHaveBeenCalledWith(
      "sync-player-sources",
      { trackedPlayerId: "tracked-player-1" },
      expect.objectContaining({
        jobId: expect.stringMatching(/^all-tracked-player-1-\d+$/),
        attempts: 3,
      }),
    );
    expect(queue.add).toHaveBeenCalledTimes(1);
    expect(trackedPlayers.findById).toHaveBeenCalledTimes(1);
  });

  it("rejects missing tracked players", async () => {
    const queue = { add: jest.fn() } as Pick<
      Queue<SyncPlayerSourcesJob>,
      "add"
    >;
    const trackedPlayers = {
      findById: jest.fn().mockResolvedValue(undefined),
    } as Pick<TrackedPlayersService, "findById">;
    const service = new PlayerSyncService(
      queue as Queue<SyncPlayerSourcesJob>,
      trackedPlayers as TrackedPlayersService,
    );

    await expect(service.enqueueAllPlayerSyncs("missing")).rejects.toThrow(
      NotFoundException,
    );
    expect(queue.add).not.toHaveBeenCalled();
  });
});
