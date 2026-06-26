import { NotFoundException } from "@nestjs/common";
import type { Queue } from "bullmq";
import type { TrackedPlayersService } from "../tracked-players/tracked-players.service";
import { PlayerSyncService } from "./player-sync.service";
import type { SyncPlayerSnapshotJob } from "./player-sync.types";

describe("PlayerSyncService", () => {
  it("enqueues a WikiSync player snapshot job", async () => {
    const queue = {
      add: jest.fn().mockResolvedValue({ id: "wikisync-tracked-player-1" }),
    } as Pick<Queue<SyncPlayerSnapshotJob>, "add">;
    const trackedPlayers = {
      findById: jest.fn().mockResolvedValue({ id: "tracked-player-1" }),
    } as Pick<TrackedPlayersService, "findById">;
    const service = new PlayerSyncService(
      queue as Queue<SyncPlayerSnapshotJob>,
      trackedPlayers as TrackedPlayersService,
    );

    await expect(
      service.enqueueWikiSyncSnapshot("tracked-player-1"),
    ).resolves.toEqual({
      trackedPlayerId: "tracked-player-1",
      source: "wikisync",
      jobId: "wikisync-tracked-player-1",
      status: "queued",
    });
    expect(queue.add).toHaveBeenCalledWith(
      "sync-player-snapshot",
      { trackedPlayerId: "tracked-player-1", source: "wikisync" },
      expect.objectContaining({
        jobId: "wikisync-tracked-player-1",
        attempts: 3,
      }),
    );
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

    await expect(service.enqueueWikiSyncSnapshot("missing")).rejects.toThrow(
      NotFoundException,
    );
    expect(queue.add).not.toHaveBeenCalled();
  });
});
