import type {
  CanonicalPlayerSnapshot,
  CanonicalPlayerSnapshotMergeResult,
  CanonicalPlayerSnapshotUpdate,
  CanonicalSkillProgress,
} from "./canonical-player-snapshot.types";

export function emptyCanonicalPlayerSnapshot(): CanonicalPlayerSnapshot {
  return {
    skills: {},
    itemsUnlocked: {},
    bosses: {},
  };
}

export function mergeCanonicalPlayerSnapshot(
  previous: CanonicalPlayerSnapshot | null,
  update: CanonicalPlayerSnapshotUpdate,
): CanonicalPlayerSnapshotMergeResult {
  const snapshot = cloneSnapshot(previous ?? emptyCanonicalPlayerSnapshot());

  for (const [skill, progress] of Object.entries(update.skills ?? {})) {
    snapshot.skills[skill] = maxSkillProgress(snapshot.skills[skill], progress);
  }

  if (update.overall) {
    snapshot.overall = maxSkillProgress(snapshot.overall, update.overall);
  }

  for (const [itemKey, item] of Object.entries(update.itemsUnlocked ?? {})) {
    if (!snapshot.itemsUnlocked[itemKey]) {
      snapshot.itemsUnlocked[itemKey] = { ...item };
    }
  }

  for (const [boss, progress] of Object.entries(update.bosses ?? {})) {
    const previousCount = snapshot.bosses[boss]?.count ?? 0;
    snapshot.bosses[boss] = { count: Math.max(previousCount, progress.count) };
  }

  return {
    snapshot,
    changed: !previous || !snapshotsEqual(previous, snapshot),
  };
}

function maxSkillProgress(
  previous: CanonicalSkillProgress | undefined,
  next: CanonicalSkillProgress,
): CanonicalSkillProgress {
  if (!previous) {
    return { ...next };
  }

  return {
    level: Math.max(previous.level, next.level),
    xp: maxOptionalNumber(previous.xp, next.xp),
  };
}

function maxOptionalNumber(
  previous: number | undefined,
  next: number | undefined,
): number | undefined {
  if (previous === undefined) {
    return next;
  }

  if (next === undefined) {
    return previous;
  }

  return Math.max(previous, next);
}

function cloneSnapshot(
  snapshot: CanonicalPlayerSnapshot,
): CanonicalPlayerSnapshot {
  return {
    skills: Object.fromEntries(
      Object.entries(snapshot.skills ?? {}).map(([skill, progress]) => [
        skill,
        { level: progress.level, xp: progress.xp },
      ]),
    ),
    overall: snapshot.overall ? { ...snapshot.overall } : undefined,
    itemsUnlocked: Object.fromEntries(
      Object.entries(snapshot.itemsUnlocked ?? {}).map(([itemKey, item]) => [
        itemKey,
        { ...item },
      ]),
    ),
    bosses: Object.fromEntries(
      Object.entries(snapshot.bosses ?? {}).map(([boss, progress]) => [
        boss,
        { ...progress },
      ]),
    ),
  };
}

function snapshotsEqual(
  left: CanonicalPlayerSnapshot,
  right: CanonicalPlayerSnapshot,
): boolean {
  return (
    JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right))
  );
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entryValue]) => [key, stableValue(entryValue)]),
  );
}
