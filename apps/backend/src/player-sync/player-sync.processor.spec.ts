import type { Job } from "bullmq";
import type { CollectionLogSyncService } from "./collection-log-sync.service";
import type { HiscoreSyncService } from "./hiscore-sync.service";
import { PlayerSyncProcessor } from "./player-sync.processor";
import type { SyncPlayerSourcesJob } from "./player-sync.types";

describe("PlayerSyncProcessor", () => {
  it("continues to later sources when an earlier source fails", async () => {
    const hiscoreSync = {
      syncWikiSyncSnapshot: jest.fn().mockRejectedValue(new Error("Wiki down")),
    } as Pick<HiscoreSyncService, "syncWikiSyncSnapshot">;
    const collectionLogSync = {
      syncTempleOsrsCollectionLog: jest.fn().mockResolvedValue(undefined),
    } as Pick<CollectionLogSyncService, "syncTempleOsrsCollectionLog">;
    const processor = new PlayerSyncProcessor(
      hiscoreSync as HiscoreSyncService,
      collectionLogSync as CollectionLogSyncService,
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
    expect(collectionLogSync.syncTempleOsrsCollectionLog).toHaveBeenCalledWith(
      "tracked-player-1",
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("wikisync sync failed"),
      expect.any(String),
    );
  });
});
