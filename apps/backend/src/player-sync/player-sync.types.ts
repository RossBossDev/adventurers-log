import type { Json } from "../database/database.types";

export const PLAYER_SYNC_QUEUE = "player-sync";
export const SYNC_PLAYER_SOURCES_JOB = "sync-player-sources";
export const ALL_PLAYER_SYNC_SOURCES = "all" as const;
export const WIKISYNC_SOURCE = "wikisync" as const;
export const TEMPLEOSRS_SOURCE = "templeosrs" as const;

export type IngestionSource = typeof WIKISYNC_SOURCE | typeof TEMPLEOSRS_SOURCE;

export type SyncPlayerSourcesJob = {
  trackedPlayerId: string;
};

export type QueuedPlayerSync = {
  trackedPlayerId: string;
  source: typeof ALL_PLAYER_SYNC_SOURCES;
  jobId: string;
  status: "queued";
};

export type QueuedPlayerSyncBatch = {
  trackedPlayerId: string;
  status: "queued";
  jobs: QueuedPlayerSync[];
};

export type RankedSkill = {
  rank: number | null;
  level: number;
  xp: number;
};

export type RankedActivity = {
  rank: number | null;
  score: number;
};

export type NormalizedPlayerSnapshot = {
  source: typeof WIKISYNC_SOURCE;
  username: string;
  fetchedAt: string;
  overall?: RankedSkill;
  skills: Record<string, RankedSkill>;
  activities: Record<string, RankedActivity>;
};

export type NormalizedTempleOsrsItem = {
  count: number;
  itemDate: number | null;
  hours?: number;
  missingHours?: number;
};

export type NormalizedTempleOsrsKillcount = {
  kc: number;
};

export type NormalizedTempleOsrsSnapshot = {
  source: typeof TEMPLEOSRS_SOURCE;
  username: string;
  playerNameWithCapitalization: string | null;
  gameMode: number;
  lastChecked: string;
  lastChanged: string;
  items: Record<string, NormalizedTempleOsrsItem>;
  killcounts: Record<string, NormalizedTempleOsrsKillcount>;
};

export type ProviderPlayerSnapshotResult = {
  source: typeof WIKISYNC_SOURCE;
  sourceUsername: string;
  fetchedAt: Date;
  httpStatus: number;
  cached: boolean | null;
  rawPayload: Json;
  playerPayload: unknown;
};

export type ProviderTempleOsrsResult = {
  source: typeof TEMPLEOSRS_SOURCE;
  sourceUsername: string;
  fetchedAt: Date;
  httpStatus: number;
  rawPayload: Json;
  snapshotPayload: unknown;
};

export type OsrsWikiItemMapping = {
  id: number;
  name: string;
  examine: string | null;
  icon: string | null;
  members: boolean | null;
  raw: Json;
};

export interface PlayerSnapshotProvider {
  readonly source: typeof WIKISYNC_SOURCE;
  fetchPlayer(username: string): Promise<ProviderPlayerSnapshotResult>;
}

export interface TempleOsrsSnapshotProvider {
  readonly source: typeof TEMPLEOSRS_SOURCE;
  fetchSnapshot(username: string): Promise<ProviderTempleOsrsResult>;
}
