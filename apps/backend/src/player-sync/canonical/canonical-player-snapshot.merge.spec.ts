import { mergeCanonicalPlayerSnapshot } from "./canonical-player-snapshot.merge";
import type { CanonicalPlayerSnapshot } from "./canonical-player-snapshot.types";

const baseline: CanonicalPlayerSnapshot = {
  overall: { level: 1000, xp: 1_000_000 },
  skills: { slayer: { level: 87, xp: 4_000_000 } },
  itemsUnlocked: { "4151": { id: 4151, acquiredAt: null } },
  bosses: { kraken: { count: 100 } },
};

describe("mergeCanonicalPlayerSnapshot", () => {
  it("creates a baseline from an empty previous snapshot", () => {
    expect(
      mergeCanonicalPlayerSnapshot(null, {
        skills: { slayer: { level: 87, xp: 4_000_000 } },
      }),
    ).toEqual({
      changed: true,
      snapshot: {
        skills: { slayer: { level: 87, xp: 4_000_000 } },
        itemsUnlocked: {},
        bosses: {},
      },
    });
  });

  it("ignores regressing skill level and XP", () => {
    expect(
      mergeCanonicalPlayerSnapshot(baseline, {
        skills: { slayer: { level: 86, xp: 3_900_000 } },
      }),
    ).toEqual({ changed: false, snapshot: baseline });
  });

  it("adds skill improvements", () => {
    expect(
      mergeCanonicalPlayerSnapshot(baseline, {
        skills: { slayer: { level: 90, xp: 5_000_000 } },
      }).snapshot.skills.slayer,
    ).toEqual({ level: 90, xp: 5_000_000 });
  });

  it("keeps unlocked items when later updates omit them", () => {
    expect(
      mergeCanonicalPlayerSnapshot(baseline, {}).snapshot.itemsUnlocked,
    ).toEqual({ "4151": { id: 4151, acquiredAt: null } });
  });

  it("keeps max boss count when later update regresses", () => {
    expect(
      mergeCanonicalPlayerSnapshot(baseline, {
        bosses: { kraken: { count: 90 } },
      }),
    ).toEqual({ changed: false, snapshot: baseline });
  });

  it("returns changed false for no-op updates", () => {
    expect(mergeCanonicalPlayerSnapshot(baseline, {})).toEqual({
      changed: false,
      snapshot: baseline,
    });
  });

  it("returns changed false when equivalent snapshots use different object key insertion orders", () => {
    const previous = {
      bosses: {},
      skills: { slayer: { xp: 4_000_000, level: 87 } },
      itemsUnlocked: {
        "4151": { acquiredAt: null, id: 4151 },
      },
      overall: { xp: 1_000_000, level: 1000 },
    } as unknown as CanonicalPlayerSnapshot;

    expect(mergeCanonicalPlayerSnapshot(previous, {})).toEqual({
      changed: false,
      snapshot: {
        skills: { slayer: { level: 87, xp: 4_000_000 } },
        overall: { xp: 1_000_000, level: 1000 },
        itemsUnlocked: { "4151": { acquiredAt: null, id: 4151 } },
        bosses: {},
      },
    });
  });

  it("coerces legacy partial snapshots that are missing canonical collections", () => {
    const previous = {
      overall: { level: 1999, xp: 100_000_000 },
      skills: { slayer: { level: 87, xp: 4_000_000, rank: 1 } },
    } as unknown as CanonicalPlayerSnapshot;

    expect(
      mergeCanonicalPlayerSnapshot(previous, {
        itemsUnlocked: { "4151": { id: 4151, acquiredAt: null } },
      }),
    ).toEqual({
      changed: true,
      snapshot: {
        overall: { level: 1999, xp: 100_000_000 },
        skills: { slayer: { level: 87, xp: 4_000_000 } },
        itemsUnlocked: { "4151": { id: 4151, acquiredAt: null } },
        bosses: {},
      },
    });
  });
});
