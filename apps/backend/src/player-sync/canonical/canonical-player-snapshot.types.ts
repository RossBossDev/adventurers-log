export type CanonicalSkillProgress = {
  level: number;
  xp?: number;
};

export type CanonicalUnlockedItem = {
  id: number;
  acquiredAt: string | null;
};

export type CanonicalBossProgress = {
  count: number;
};

export type CanonicalPlayerSnapshot = {
  skills: Record<string, CanonicalSkillProgress>;
  overall?: CanonicalSkillProgress;
  itemsUnlocked: Record<string, CanonicalUnlockedItem>;
  bosses: Record<string, CanonicalBossProgress>;
};

export type CanonicalPlayerSnapshotUpdate = {
  skills?: Record<string, CanonicalSkillProgress>;
  overall?: CanonicalSkillProgress;
  itemsUnlocked?: Record<string, CanonicalUnlockedItem>;
  bosses?: Record<string, CanonicalBossProgress>;
};

export type CanonicalPlayerSnapshotMergeResult = {
  snapshot: CanonicalPlayerSnapshot;
  changed: boolean;
};
