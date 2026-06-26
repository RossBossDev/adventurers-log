import type {
  NormalizedPlayerSnapshot,
  NormalizedTempleOsrsSnapshot,
} from "../player-sync.types";
import type {
  CanonicalPlayerSnapshotUpdate,
  CanonicalSkillProgress,
} from "./canonical-player-snapshot.types";

export function canonicalUpdateFromWikiSyncSnapshot(
  snapshot: NormalizedPlayerSnapshot,
): CanonicalPlayerSnapshotUpdate {
  const skills: Record<string, CanonicalSkillProgress> = {};

  for (const [skill, progress] of Object.entries(snapshot.skills)) {
    skills[skill] = { level: progress.level, xp: progress.xp };
  }

  return {
    overall: snapshot.overall
      ? { level: snapshot.overall.level, xp: snapshot.overall.xp }
      : undefined,
    skills,
  };
}

export function canonicalUpdateFromTempleOsrsSnapshot(
  snapshot: NormalizedTempleOsrsSnapshot,
): CanonicalPlayerSnapshotUpdate {
  const itemsUnlocked: CanonicalPlayerSnapshotUpdate["itemsUnlocked"] = {};

  for (const [itemKey, item] of Object.entries(snapshot.items)) {
    if (item.count <= 0) {
      continue;
    }

    const itemId = Number(itemKey);
    itemsUnlocked[itemKey] = {
      id: itemId,
      acquiredAt: item.itemDate
        ? new Date(item.itemDate * 1000).toISOString()
        : null,
    };
  }

  const bosses: CanonicalPlayerSnapshotUpdate["bosses"] = {};

  for (const [boss, killcount] of Object.entries(snapshot.killcounts)) {
    if (killcount.kc <= 0) {
      continue;
    }

    bosses[boss] = { count: killcount.kc };
  }

  return { itemsUnlocked, bosses };
}
