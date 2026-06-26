import type { Json } from "../database/database.types";

export const PLAYER_SYNC_QUEUE = "player-sync";
export const SYNC_PLAYER_SNAPSHOT_JOB = "sync-player-snapshot";
export const WIKISYNC_SOURCE = "wikisync" as const;

export type IngestionSource = typeof WIKISYNC_SOURCE;

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
  source: IngestionSource;
  username: string;
  fetchedAt: string;
  overall?: RankedSkill;
  skills: Record<string, RankedSkill>;
  activities: Record<string, RankedActivity>;
};

export type ProviderPlayerSnapshotResult = {
  source: IngestionSource;
  sourceUsername: string;
  fetchedAt: Date;
  httpStatus: number;
  cached: boolean | null;
  rawPayload: Json;
  playerPayload: unknown;
};

export interface PlayerSnapshotProvider {
  readonly source: IngestionSource;
  fetchPlayer(username: string): Promise<ProviderPlayerSnapshotResult>;
}
