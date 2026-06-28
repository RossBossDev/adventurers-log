import {
  type NormalizedTempleOsrsSnapshot,
  TEMPLEOSRS_SOURCE,
} from "../../player-sync.types";

export class InvalidTempleOsrsSnapshotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTempleOsrsSnapshotError";
  }
}

export function normalizeTempleOsrsSnapshot(
  payload: unknown,
): NormalizedTempleOsrsSnapshot {
  const root = readRecord(payload, "response");
  const data = readRecord(root.data, "data");
  const itemsPayload = readRecord(data.items, "data.items");
  const items: NormalizedTempleOsrsSnapshot["items"] = {};

  for (const [itemId, itemPayload] of Object.entries(itemsPayload)) {
    if (!/^\d+$/.test(itemId)) {
      throw new InvalidTempleOsrsSnapshotError(
        `TempleOSRS item id must be numeric: ${itemId}.`,
      );
    }

    const item = readRecord(itemPayload, `data.items.${itemId}`);
    items[itemId] = {
      count: readNumber(item.count, `data.items.${itemId}.count`),
      itemDate: readNullableNumber(
        item.item_date,
        `data.items.${itemId}.item_date`,
      ),
      hours: readOptionalNumber(item.hours, `data.items.${itemId}.hours`),
      missingHours: readOptionalNumber(
        item.missing_hours,
        `data.items.${itemId}.missing_hours`,
      ),
    };
  }

  const killcountsPayload = readRecord(data.killcounts, "data.killcounts");
  const killcounts: NormalizedTempleOsrsSnapshot["killcounts"] = {};

  for (const [boss, killcountPayload] of Object.entries(killcountsPayload)) {
    const killcount = readRecord(killcountPayload, `data.killcounts.${boss}`);
    killcounts[boss] = {
      kc: readNumber(killcount.kc, `data.killcounts.${boss}.kc`),
    };
  }

  return {
    source: TEMPLEOSRS_SOURCE,
    username: readString(data.player, "data.player"),
    playerNameWithCapitalization: readNullableString(
      data.player_name_with_capitalization,
      "data.player_name_with_capitalization",
    ),
    gameMode: readNumber(data.game_mode, "data.game_mode"),
    lastChecked: readString(data.last_checked, "data.last_checked"),
    lastChanged: readString(data.last_changed, "data.last_changed"),
    items,
    killcounts,
  };
}

function readString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new InvalidTempleOsrsSnapshotError(
      `TempleOSRS ${path} must be a string.`,
    );
  }

  return value;
}

function readNullableString(value: unknown, path: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return readString(value, path);
}

function readNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new InvalidTempleOsrsSnapshotError(
      `TempleOSRS ${path} must be a number.`,
    );
  }

  return value;
}

function readNullableNumber(value: unknown, path: string): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return readNumber(value, path);
}

function readOptionalNumber(value: unknown, path: string): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  return readNumber(value, path);
}

function readRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new InvalidTempleOsrsSnapshotError(
      `TempleOSRS ${path} must be an object.`,
    );
  }

  return value as Record<string, unknown>;
}
