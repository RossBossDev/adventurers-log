import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Json } from "../database/database.types";
import { TrackedPlayersService } from "../tracked-players/tracked-players.service";
import { PlayerSnapshotStoreService } from "./player-snapshot-store.service";
import { WikiSyncProvider } from "./sources/wikisync/wikisync.provider";
import { normalizeWikiSyncPlayerSnapshot } from "./sources/wikisync/wikisync-snapshot.mapper";

@Injectable()
export class HiscoreSyncService {
  private readonly logger = new Logger(HiscoreSyncService.name);

  constructor(
    @Inject(TrackedPlayersService)
    private readonly trackedPlayers: TrackedPlayersService,
    @Inject(WikiSyncProvider)
    private readonly wikiSyncProvider: WikiSyncProvider,
    @Inject(PlayerSnapshotStoreService)
    private readonly snapshotStore: PlayerSnapshotStoreService,
  ) {}

  async syncWikiSyncSnapshot(trackedPlayerId: string): Promise<void> {
    const trackedPlayer = await this.trackedPlayers.findById(trackedPlayerId);

    if (!trackedPlayer) {
      throw new NotFoundException("Tracked player not found.");
    }

    const providerResult = await this.wikiSyncProvider.fetchPlayer(
      trackedPlayer.normalized_username,
    );
    this.logger.log(
      `Fetched ${providerResult.source} snapshot for ${providerResult.sourceUsername}; cached=${providerResult.cached ?? "unknown"}.`,
    );

    const normalized = normalizeWikiSyncPlayerSnapshot(
      providerResult.playerPayload,
    );

    await this.snapshotStore.storeSnapshot(
      {
        trackedPlayerId: trackedPlayer.id,
        source: providerResult.source,
        sourceUsername: providerResult.sourceUsername,
        fetchedAt: providerResult.fetchedAt,
        httpStatus: providerResult.httpStatus,
        cached: providerResult.cached,
        rawPayload: providerResult.rawPayload,
      },
      normalized as Json,
    );
  }
}
