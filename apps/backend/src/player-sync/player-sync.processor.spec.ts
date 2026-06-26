import type { Job } from "bullmq";
import type { HiscoreSyncService } from "./hiscore-sync.service";
import { PlayerSyncProcessor } from "./player-sync.processor";
import type { SyncPlayerSourcesJob } from "./player-sync.types";
import type { TempleOsrsSyncService } from "./templeosrs-sync.service";

describe("PlayerSyncProcessor", () => {
  it("continues to later sources when an earlier source fails", async () => {
    const hiscoreSync = {
      syncWikiSyncSnapshot: jest.fn().mockRejectedValue(new Error("Wiki down")),
    } as Pick<HiscoreSyncService, "syncWikiSyncSnapshot">;
    const templeOsrsSync = {
      syncTempleOsrsSnapshot: jest.fn().mockResolvedValue(undefined),
    } as Pick<TempleOsrsSyncService, "syncTempleOsrsSnapshot">;
    const processor = new PlayerSyncProcessor(
      hiscoreSync as HiscoreSyncService,
      templeOsrsSync as TempleOsrsSyncService,
    );

    const logger = (
      processor as unknown as {
        logger: { log: jest.MockableFunction; error: jest.MockableFunction };
      }
    ).logger;
    jest.spyOn(logger, "log").mockImplementation(() => undefined);
    jest.spyOn(logger, "error").mockImplementation(() => undefined);

    await expect(
      processor.process({
        id: "job-1",
        data: { trackedPlayerId: "tracked-player-1" },
      } as Job<SyncPlayerSourcesJob>),
    ).resolves.toBeUndefined();

    expect(hiscoreSync.syncWikiSyncSnapshot).toHaveBeenCalledWith(
      "tracked-player-1",
    );
    expect(templeOsrsSync.syncTempleOsrsSnapshot).toHaveBeenCalledWith(
      "tracked-player-1",
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("wikisync sync failed"),
      expect.any(String),
    );
  });
});
