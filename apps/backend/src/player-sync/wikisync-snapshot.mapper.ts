import {
  type NormalizedPlayerSnapshot,
  type RankedActivity,
  type RankedSkill,
  WIKISYNC_SOURCE,
} from "./player-sync.types";

export class InvalidWikiSyncSnapshotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidWikiSyncSnapshotError";
  }
}

export function normalizeWikiSyncPlayerSnapshot(
  playerPayload: unknown,
): NormalizedPlayerSnapshot {
  if (!isRecord(playerPayload)) {
    throw new InvalidWikiSyncSnapshotError(
      "WikiSync player payload is invalid.",
    );
  }

  if (playerPayload.ok !== true) {
    throw new InvalidWikiSyncSnapshotError(
      "WikiSync player payload is not ok.",
    );
  }

  const username = readString(playerPayload.username, "username");
  const fetchedAt = readString(playerPayload.fetchedAt, "fetchedAt");
  const hiscores = readRecord(playerPayload.hiscores, "hiscores");
  const skillsPayload = readRecord(hiscores.skills, "hiscores.skills");
  const activitiesPayload = readOptionalRecord(hiscores.activities);
  const skills: Record<string, RankedSkill> = {};
  let overall: RankedSkill | undefined;

  for (const [name, value] of Object.entries(skillsPayload)) {
    const skill = mapSkill(value, `hiscores.skills.${name}`);

    if (name === "overall") {
      overall = skill;
    } else {
      skills[name] = skill;
    }
  }

  const activities: Record<string, RankedActivity> = {};

  for (const [name, value] of Object.entries(activitiesPayload ?? {})) {
    activities[name] = mapActivity(value, `hiscores.activities.${name}`);
  }

  return {
    source: WIKISYNC_SOURCE,
    username,
    fetchedAt,
    overall,
    skills,
    activities,
  };
}

function mapSkill(value: unknown, path: string): RankedSkill {
  const record = readRecord(value, path);

  return {
    rank: readNullableNumber(record.rank, `${path}.rank`),
    level: readNumber(record.level, `${path}.level`),
    xp: readNumber(record.xp, `${path}.xp`),
  };
}

function mapActivity(value: unknown, path: string): RankedActivity {
  const record = readRecord(value, path);

  return {
    rank: readNullableNumber(record.rank, `${path}.rank`),
    score: readNumber(record.score, `${path}.score`),
  };
}

function readString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new InvalidWikiSyncSnapshotError(
      `WikiSync ${path} must be a string.`,
    );
  }

  return value;
}

function readNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new InvalidWikiSyncSnapshotError(
      `WikiSync ${path} must be a number.`,
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

function readRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new InvalidWikiSyncSnapshotError(
      `WikiSync ${path} must be an object.`,
    );
  }

  return value;
}

function readOptionalRecord(
  value: unknown,
): Record<string, unknown> | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new InvalidWikiSyncSnapshotError(
      "WikiSync hiscores.activities must be an object.",
    );
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
