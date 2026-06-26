import {
  canonicalUpdateFromTempleOsrsCollectionLogSnapshot,
  canonicalUpdateFromWikiSyncSnapshot,
} from "./canonical-player-snapshot.adapters";

describe("canonical player snapshot adapters", () => {
  it("maps WikiSync normalized skills and overall to a canonical update", () => {
    expect(
      canonicalUpdateFromWikiSyncSnapshot({
        source: "wikisync",
        username: "techdad69",
        fetchedAt: "2026-06-26T03:07:34.349Z",
        overall: { rank: 1, level: 2000, xp: 100_000_000 },
        skills: { slayer: { rank: 2, level: 90, xp: 5_000_000 } },
        activities: {},
      }),
    ).toEqual({
      overall: { level: 2000, xp: 100_000_000 },
      skills: { slayer: { level: 90, xp: 5_000_000 } },
    });
  });

  it("maps TempleOSRS item counts above zero to unlocked canonical items", () => {
    expect(
      canonicalUpdateFromTempleOsrsCollectionLogSnapshot({
        source: "templeosrs_collection_log",
        username: "Techdad69",
        playerNameWithCapitalization: null,
        gameMode: 0,
        lastChecked: "2026-06-26 01:58:46",
        lastChanged: "2026-06-26 01:58:46",
        items: {
          "13262": { count: 0, itemDate: null },
          "4151": { count: 2, itemDate: 1782439126 },
        },
      }),
    ).toEqual({
      itemsUnlocked: {
        "4151": { id: 4151, acquiredAt: "2026-06-26T01:58:46.000Z" },
      },
    });
  });
});
