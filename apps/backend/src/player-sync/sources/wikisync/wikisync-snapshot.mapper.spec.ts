import {
  InvalidWikiSyncSnapshotError,
  normalizeWikiSyncPlayerSnapshot,
} from "./wikisync-snapshot.mapper";

const playerPayload = {
  ok: true,
  username: "techdad69",
  fetchedAt: "2026-06-26T03:07:34.349Z",
  cached: false,
  hiscores: {
    skills: {
      overall: { rank: 204975, level: 2202, xp: 204101626 },
      attack: { rank: 292664, level: 99, xp: 14228467 },
      sailing: { rank: 207234, level: 80, xp: 2077310 },
    },
    activities: {
      "clue scrolls (all)": { rank: 424202, score: 165 },
      "abyssal sire": { rank: 284613, score: 50 },
    },
  },
};

describe("normalizeWikiSyncPlayerSnapshot", () => {
  it("maps overall, skills, and activities from a WikiSync player payload", () => {
    expect(normalizeWikiSyncPlayerSnapshot(playerPayload)).toEqual({
      source: "wikisync",
      username: "techdad69",
      fetchedAt: "2026-06-26T03:07:34.349Z",
      overall: { rank: 204975, level: 2202, xp: 204101626 },
      skills: {
        attack: { rank: 292664, level: 99, xp: 14228467 },
        sailing: { rank: 207234, level: 80, xp: 2077310 },
      },
      activities: {
        "clue scrolls (all)": { rank: 424202, score: 165 },
        "abyssal sire": { rank: 284613, score: 50 },
      },
    });
  });

  it("allows unranked stats", () => {
    expect(
      normalizeWikiSyncPlayerSnapshot({
        ...playerPayload,
        hiscores: {
          skills: { overall: { rank: null, level: 1, xp: 0 } },
          activities: { "lms - rank": { score: 500 } },
        },
      }),
    ).toEqual(
      expect.objectContaining({
        overall: { rank: null, level: 1, xp: 0 },
        activities: { "lms - rank": { rank: null, score: 500 } },
      }),
    );
  });

  it("rejects provider player errors", () => {
    expect(() =>
      normalizeWikiSyncPlayerSnapshot({ ok: false, username: "missing" }),
    ).toThrow(InvalidWikiSyncSnapshotError);
  });
});
