import { diffCanonicalPlayerSnapshots } from "./canonical-player-snapshot.diff";
import type { CanonicalPlayerSnapshot } from "./canonical-player-snapshot.types";

const occurredAt = new Date("2026-06-26T12:00:00.000Z");

function diff(
  previous: CanonicalPlayerSnapshot | null,
  current: CanonicalPlayerSnapshot,
) {
  return diffCanonicalPlayerSnapshots({
    trackedPlayerId: "tracked-player-id",
    previousSnapshotId: previous ? "previous-snapshot-id" : null,
    currentSnapshotId: "current-snapshot-id",
    previous,
    current,
    occurredAt,
  });
}

describe("diffCanonicalPlayerSnapshots", () => {
  it("creates no events for the first snapshot", () => {
    expect(diff(null, snapshot({ slayer: 87 }, 1999))).toEqual([]);
  });

  it("creates no events when canonical progress does not change", () => {
    expect(
      diff(snapshot({ slayer: 87 }, 1999), snapshot({ slayer: 87 }, 1999)),
    ).toEqual([]);
  });

  it("creates one skill event for a single level-up", () => {
    expect(
      diff(snapshot({ slayer: 87 }, 1999), snapshot({ slayer: 88 }, 1999)),
    ).toEqual([
      expect.objectContaining({
        eventType: "skill_level_up",
        subjectType: "skill",
        subjectKey: "slayer",
        fromValue: 87,
        toValue: 88,
        milestoneValue: null,
        idempotencyKey:
          "tracked-player:tracked-player-id:skill-level-up:slayer:88",
      }),
    ]);
  });

  it("creates one skill event for a multi-level skill jump", () => {
    expect(
      diff(snapshot({ slayer: 87 }, 1999), snapshot({ slayer: 90 }, 1999)),
    ).toEqual([
      expect.objectContaining({
        eventType: "skill_level_up",
        subjectKey: "slayer",
        fromValue: 87,
        toValue: 90,
      }),
    ]);
  });

  it("creates one total-level event when crossing one 25-level milestone", () => {
    expect(diff(snapshot({}, 1999), snapshot({}, 2000))).toEqual([
      expect.objectContaining({
        eventType: "total_level_milestone",
        subjectType: "overall",
        subjectKey: "overall",
        fromValue: 1999,
        toValue: 2000,
        milestoneValue: 2000,
        idempotencyKey:
          "tracked-player:tracked-player-id:total-level-milestone:2000",
      }),
    ]);
  });

  it("creates multiple total-level events when crossing multiple 25-level milestones", () => {
    expect(diff(snapshot({}, 1999), snapshot({}, 2026))).toEqual([
      expect.objectContaining({ milestoneValue: 2000 }),
      expect.objectContaining({ milestoneValue: 2025 }),
    ]);
  });

  it("creates no total-level event without crossing a 25-level boundary", () => {
    expect(diff(snapshot({}, 2001), snapshot({}, 2024))).toEqual([]);
  });
});

function snapshot(
  skills: Record<string, number>,
  overallLevel?: number,
): CanonicalPlayerSnapshot {
  return {
    overall: overallLevel === undefined ? undefined : { level: overallLevel },
    skills: Object.fromEntries(
      Object.entries(skills).map(([skill, level]) => [skill, { level }]),
    ),
    itemsUnlocked: {},
    bosses: {},
  };
}
