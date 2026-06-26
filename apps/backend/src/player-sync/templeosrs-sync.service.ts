import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { TrackedPlayersService } from "../tracked-players/tracked-players.service";
import { canonicalUpdateFromTempleOsrsSnapshot } from "./canonical/canonical-player-snapshot.adapters";
import { OsrsItemCacheService } from "./items/osrs-item-cache.service";
import { PlayerSnapshotStoreService } from "./player-snapshot-store.service";
import { TempleOsrsProvider } from "./sources/templeosrs/templeosrs.provider";
import { normalizeTempleOsrsSnapshot } from "./sources/templeosrs/templeosrs-snapshot.mapper";

@Injectable()
export class TempleOsrsSyncService {
  private readonly logger = new Logger(TempleOsrsSyncService.name);

  constructor(
    @Inject(TrackedPlayersService)
    private readonly trackedPlayers: TrackedPlayersService,
    @Inject(TempleOsrsProvider)
    private readonly templeOsrsProvider: TempleOsrsProvider,
    @Inject(OsrsItemCacheService)
    private readonly osrsItemCache: OsrsItemCacheService,
    @Inject(PlayerSnapshotStoreService)
    private readonly snapshotStore: PlayerSnapshotStoreService,
  ) {}

  async syncTempleOsrsSnapshot(trackedPlayerId: string): Promise<void> {
    const trackedPlayer = await this.trackedPlayers.findById(trackedPlayerId);

    if (!trackedPlayer) {
      throw new NotFoundException("Tracked player not found.");
    }

    await this.osrsItemCache.refreshIfStale();

    const providerResult = await this.templeOsrsProvider.fetchSnapshot(
      trackedPlayer.normalized_username,
    );
    this.logger.log(
      `Fetched ${providerResult.source} snapshot for ${providerResult.sourceUsername}.`,
    );

    const normalized = normalizeTempleOsrsSnapshot(
      providerResult.snapshotPayload,
    );

    await this.snapshotStore.storeSnapshot(
      {
        trackedPlayerId: trackedPlayer.id,
        source: providerResult.source,
        sourceUsername: providerResult.sourceUsername,
        fetchedAt: providerResult.fetchedAt,
        httpStatus: providerResult.httpStatus,
        cached: null,
        rawPayload: providerResult.rawPayload,
      },
      canonicalUpdateFromTempleOsrsSnapshot(normalized),
    );
  }
}
