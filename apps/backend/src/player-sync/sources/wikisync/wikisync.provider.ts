import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AppConfig } from "../../../config/app.config";
import type { Json } from "../../../database/database.types";
import {
  type PlayerSnapshotProvider,
  type ProviderPlayerSnapshotResult,
  WIKISYNC_SOURCE,
} from "../../player-sync.types";

export class WikiSyncProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WikiSyncProviderError";
  }
}

@Injectable()
export class WikiSyncProvider implements PlayerSnapshotProvider {
  readonly source = WIKISYNC_SOURCE;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async fetchPlayer(username: string): Promise<ProviderPlayerSnapshotResult> {
    const url = new URL(
      "/api/players",
      this.configService.get("WIKISYNC_BASE_URL", { infer: true }),
    );
    url.searchParams.set("usernames", username);

    const response = await fetch(url);
    const rawPayload = await parseJson(response);

    if (!response.ok) {
      throw new WikiSyncProviderError(
        `WikiSync request failed with HTTP ${response.status}.`,
      );
    }

    const playerPayload = findPlayer(rawPayload, username);

    return {
      source: WIKISYNC_SOURCE,
      sourceUsername: readSourceUsername(playerPayload, username),
      fetchedAt: readFetchedAt(playerPayload),
      httpStatus: response.status,
      cached: readCached(playerPayload),
      rawPayload: rawPayload as Json,
      playerPayload,
    };
  }
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new WikiSyncProviderError("WikiSync response was not valid JSON.");
  }
}

function findPlayer(payload: unknown, username: string): unknown {
  if (
    !isRecord(payload) ||
    payload.ok !== true ||
    !Array.isArray(payload.players)
  ) {
    throw new WikiSyncProviderError("WikiSync response shape was invalid.");
  }

  const player = payload.players.find(
    (candidate) =>
      isRecord(candidate) &&
      typeof candidate.username === "string" &&
      candidate.username.toLowerCase() === username.toLowerCase(),
  );

  const selectedPlayer = player ?? payload.players[0];

  if (!isRecord(selectedPlayer) || selectedPlayer.ok !== true) {
    throw new WikiSyncProviderError("WikiSync did not return a synced player.");
  }

  return selectedPlayer;
}

function readSourceUsername(playerPayload: unknown, fallback: string): string {
  if (isRecord(playerPayload) && typeof playerPayload.username === "string") {
    return playerPayload.username;
  }

  return fallback;
}

function readFetchedAt(playerPayload: unknown): Date {
  if (isRecord(playerPayload) && typeof playerPayload.fetchedAt === "string") {
    const fetchedAt = new Date(playerPayload.fetchedAt);

    if (!Number.isNaN(fetchedAt.getTime())) {
      return fetchedAt;
    }
  }

  return new Date();
}

function readCached(playerPayload: unknown): boolean | null {
  if (isRecord(playerPayload) && typeof playerPayload.cached === "boolean") {
    return playerPayload.cached;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
