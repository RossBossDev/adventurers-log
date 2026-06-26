import type { Json } from "../database/database.types";

export const PLAYER_SYNC_QUEUE = "player-sync";
export const SYNC_PLAYER_SNAPSHOT_JOB = "sync-player-snapshot";
export const WIKISYNC_SOURCE = "wikisync" as const;
export const TEMPLEOSRS_COLLECTION_LOG_SOURCE =
  "templeosrs_collection_log" as const;

export type IngestionSource =
  | typeof WIKISYNC_SOURCE
  | typeof TEMPLEOSRS_COLLECTION_LOG_SOURCE;

export type SyncPlayerSnapshotJob = {
  trackedPlayerId: string;
  source: IngestionSource;
};

export type QueuedPlayerSync = {
  trackedPlayerId: string;
  source: IngestionSource;
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

export type NormalizedCollectionLogItem = {
  count: number;
  itemDate: number | null;
  hours?: number;
  missingHours?: number;
};

export type NormalizedCollectionLogSnapshot = {
  source: typeof TEMPLEOSRS_COLLECTION_LOG_SOURCE;
  username: string;
  playerNameWithCapitalization: string | null;
  gameMode: number;
  lastChecked: string;
  lastChanged: string;
  items: Record<string, NormalizedCollectionLogItem>;
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

export type ProviderCollectionLogResult = {
  source: typeof TEMPLEOSRS_COLLECTION_LOG_SOURCE;
  sourceUsername: string;
  fetchedAt: Date;
  httpStatus: number;
  rawPayload: Json;
  collectionPayload: unknown;
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

export interface CollectionLogProvider {
  readonly source: typeof TEMPLEOSRS_COLLECTION_LOG_SOURCE;
  fetchCollectionLog(username: string): Promise<ProviderCollectionLogResult>;
}
