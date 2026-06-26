import type { Json } from "../../database/database.types";
import type {
  CanonicalBossProgress,
  CanonicalPlayerSnapshot,
  CanonicalSkillProgress,
  CanonicalUnlockedItem,
} from "./canonical-player-snapshot.types";

export function parseCanonicalPlayerSnapshot(
  value: Json,
): CanonicalPlayerSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  const skills = parseRecord(value.skills, parseSkillProgress);
  const itemsUnlocked = parseRecord(value.itemsUnlocked, parseUnlockedItem);
  const bosses = parseRecord(value.bosses, parseBossProgress);
  const overall =
    value.overall === undefined ? undefined : parseSkillProgress(value.overall);

  if (!skills || !itemsUnlocked || !bosses || overall === null) {
    return null;
  }

  return {
    skills,
    overall,
    itemsUnlocked,
    bosses,
  };
}

function parseSkillProgress(value: unknown): CanonicalSkillProgress | null {
  if (!isRecord(value) || !isFiniteNumber(value.level)) {
    return null;
  }

  if (value.xp !== undefined && !isFiniteNumber(value.xp)) {
    return null;
  }

  return { level: value.level, xp: value.xp };
}

function parseUnlockedItem(value: unknown): CanonicalUnlockedItem | null {
  if (!isRecord(value) || !isFiniteNumber(value.id)) {
    return null;
  }

  if (value.acquiredAt !== null && typeof value.acquiredAt !== "string") {
    return null;
  }

  return { id: value.id, acquiredAt: value.acquiredAt };
}

function parseBossProgress(value: unknown): CanonicalBossProgress | null {
  if (!isRecord(value) || !isFiniteNumber(value.count)) {
    return null;
  }

  return { count: value.count };
}

function parseRecord<T>(
  value: unknown,
  parseValue: (value: unknown) => T | null,
): Record<string, T> | null {
  if (!isRecord(value)) {
    return null;
  }

  const parsed: Record<string, T> = {};

  for (const [key, recordValue] of Object.entries(value)) {
    const parsedValue = parseValue(recordValue);

    if (!parsedValue) {
      return null;
    }

    parsed[key] = parsedValue;
  }

  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
