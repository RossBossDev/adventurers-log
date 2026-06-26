import { NotFoundException } from "@nestjs/common";
import type { Queue } from "bullmq";
import type { TrackedPlayersService } from "../tracked-players/tracked-players.service";
import { PlayerSyncService } from "./player-sync.service";
import type { SyncPlayerSnapshotJob } from "./player-sync.types";

describe("PlayerSyncService", () => {
  it("enqueues all player sync jobs", async () => {
    const queue = {
      add: jest
        .fn()
        .mockResolvedValueOnce({ id: "wikisync-tracked-player-1" })
        .mockResolvedValueOnce({
          id: "templeosrs_collection_log-tracked-player-1",
        }),
    } as Pick<Queue<SyncPlayerSnapshotJob>, "add">;
    const trackedPlayers = {
      findById: jest.fn().mockResolvedValue({ id: "tracked-player-1" }),
    } as Pick<TrackedPlayersService, "findById">;
    const service = new PlayerSyncService(
      queue as Queue<SyncPlayerSnapshotJob>,
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
          source: "wikisync",
          jobId: "wikisync-tracked-player-1",
          status: "queued",
        },
        {
          trackedPlayerId: "tracked-player-1",
          source: "templeosrs_collection_log",
          jobId: "templeosrs_collection_log-tracked-player-1",
          status: "queued",
        },
      ],
    });
    expect(queue.add).toHaveBeenCalledWith(
      "sync-player-snapshot",
      { trackedPlayerId: "tracked-player-1", source: "wikisync" },
      expect.objectContaining({
        jobId: expect.stringMatching(/^wikisync-tracked-player-1-\d+$/),
        attempts: 3,
      }),
    );
    expect(queue.add).toHaveBeenCalledWith(
      "sync-player-snapshot",
      {
        trackedPlayerId: "tracked-player-1",
        source: "templeosrs_collection_log",
      },
      expect.objectContaining({
        jobId: expect.stringMatching(
          /^templeosrs_collection_log-tracked-player-1-\d+$/,
        ),
        attempts: 3,
      }),
    );
    expect(trackedPlayers.findById).toHaveBeenCalledTimes(1);
  });

  it("rejects missing tracked players", async () => {
    const queue = { add: jest.fn() } as Pick<
      Queue<SyncPlayerSnapshotJob>,
      "add"
    >;
    const trackedPlayers = {
      findById: jest.fn().mockResolvedValue(undefined),
    } as Pick<TrackedPlayersService, "findById">;
    const service = new PlayerSyncService(
      queue as Queue<SyncPlayerSnapshotJob>,
      trackedPlayers as TrackedPlayersService,
    );

    await expect(service.enqueueAllPlayerSyncs("missing")).rejects.toThrow(
      NotFoundException,
    );
    expect(queue.add).not.toHaveBeenCalled();
  });
});
