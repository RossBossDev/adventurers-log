import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AppConfig } from "../../../config/app.config";
import type { Json } from "../../../database/database.types";
import {
  type ProviderTempleOsrsResult,
  TEMPLEOSRS_SOURCE,
  type TempleOsrsSnapshotProvider,
} from "../../player-sync.types";

export class TempleOsrsProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TempleOsrsProviderError";
  }
}

@Injectable()
export class TempleOsrsProvider implements TempleOsrsSnapshotProvider {
  readonly source = TEMPLEOSRS_SOURCE;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async fetchSnapshot(username: string): Promise<ProviderTempleOsrsResult> {
    const url = new URL(
      "/api/collection-log/player_collections.php",
      this.configService.get("TEMPLEOSRS_BASE_URL", { infer: true }),
    );
    url.searchParams.set("player", username);

    const response = await fetch(url, {
      headers: { "user-agent": "adventurers-log/0.1" },
    });
    const rawPayload = await parseJson(response);

    if (!response.ok) {
      throw new TempleOsrsProviderError(
        `TempleOSRS request failed with HTTP ${response.status}.`,
      );
    }

    const data = readData(rawPayload);

    return {
      source: TEMPLEOSRS_SOURCE,
      sourceUsername: readSourceUsername(data, username),
      fetchedAt: readFetchedAt(data),
      httpStatus: response.status,
      rawPayload: rawPayload as Json,
      snapshotPayload: rawPayload,
    };
  }
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new TempleOsrsProviderError(
      "TempleOSRS response was not valid JSON.",
    );
  }
}

function readData(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    throw new TempleOsrsProviderError("TempleOSRS response shape was invalid.");
  }

  if (!isRecord(payload.data.items)) {
    throw new TempleOsrsProviderError(
      "TempleOSRS response did not include items.",
    );
  }

  return payload.data;
}

function readSourceUsername(
  data: Record<string, unknown>,
  fallback: string,
): string {
  return typeof data.player === "string" && data.player.length > 0
    ? data.player
    : fallback;
}

function readFetchedAt(data: Record<string, unknown>): Date {
  if (typeof data.last_checked === "string") {
    const fetchedAt = new Date(`${data.last_checked} UTC`);

    if (!Number.isNaN(fetchedAt.getTime())) {
      return fetchedAt;
    }
  }

  return new Date();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
