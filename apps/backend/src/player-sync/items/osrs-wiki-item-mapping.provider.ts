import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AppConfig } from "../../config/app.config";
import type { Json } from "../../database/database.types";
import type { OsrsWikiItemMapping } from "../player-sync.types";

export class OsrsWikiItemMappingProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OsrsWikiItemMappingProviderError";
  }
}

@Injectable()
export class OsrsWikiItemMappingProvider {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async fetchItems(): Promise<OsrsWikiItemMapping[]> {
    const url = new URL(
      "/api/v1/osrs/mapping",
      this.configService.get("OSRS_WIKI_PRICES_BASE_URL", { infer: true }),
    );
    const response = await fetch(url, {
      headers: { "user-agent": "adventurers-log/0.1" },
    });

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new OsrsWikiItemMappingProviderError(
        "OSRS Wiki item mapping response was not valid JSON.",
      );
    }

    if (!response.ok) {
      throw new OsrsWikiItemMappingProviderError(
        `OSRS Wiki item mapping request failed with HTTP ${response.status}.`,
      );
    }

    if (!Array.isArray(payload)) {
      throw new OsrsWikiItemMappingProviderError(
        "OSRS Wiki item mapping response shape was invalid.",
      );
    }

    return payload.map(mapItem);
  }
}

function mapItem(value: unknown): OsrsWikiItemMapping {
  if (!isRecord(value)) {
    throw new OsrsWikiItemMappingProviderError(
      "OSRS Wiki item mapping entry must be an object.",
    );
  }

  if (typeof value.id !== "number" || !Number.isInteger(value.id)) {
    throw new OsrsWikiItemMappingProviderError(
      "OSRS Wiki item mapping id must be an integer.",
    );
  }

  if (typeof value.name !== "string" || value.name.length === 0) {
    throw new OsrsWikiItemMappingProviderError(
      "OSRS Wiki item mapping name must be a string.",
    );
  }

  return {
    id: value.id,
    name: value.name,
    examine: readOptionalString(value.examine),
    icon: readOptionalString(value.icon),
    members: typeof value.members === "boolean" ? value.members : null,
    raw: value as Json,
  };
}

function readOptionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
