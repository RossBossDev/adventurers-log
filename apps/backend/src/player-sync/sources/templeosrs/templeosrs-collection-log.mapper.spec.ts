import {
  InvalidTempleOsrsCollectionLogError,
  normalizeTempleOsrsCollectionLogSnapshot,
} from "./templeosrs-collection-log.mapper";

const payload = {
  data: {
    player: "Techdad69",
    player_name_with_capitalization: null,
    game_mode: 0,
    last_checked: "2026-06-26 01:58:46",
    last_changed: "2026-06-26 01:58:46",
    items: {
      "13262": { count: 0, item_date: null, missing_hours: 37.7111 },
      "4151": { count: 2, item_date: 1782439126, hours: 0 },
    },
  },
};

describe("normalizeTempleOsrsCollectionLogSnapshot", () => {
  it("maps TempleOSRS collection-log metadata and item counts", () => {
    expect(normalizeTempleOsrsCollectionLogSnapshot(payload)).toEqual({
      source: "templeosrs_collection_log",
      username: "Techdad69",
      playerNameWithCapitalization: null,
      gameMode: 0,
      lastChecked: "2026-06-26 01:58:46",
      lastChanged: "2026-06-26 01:58:46",
      items: {
        "13262": { count: 0, itemDate: null, missingHours: 37.7111 },
        "4151": { count: 2, itemDate: 1782439126, hours: 0 },
      },
    });
  });

  it("rejects malformed item entries", () => {
    expect(() =>
      normalizeTempleOsrsCollectionLogSnapshot({
        data: { ...payload.data, items: { abc: { count: 1 } } },
      }),
    ).toThrow(InvalidTempleOsrsCollectionLogError);
  });
});
