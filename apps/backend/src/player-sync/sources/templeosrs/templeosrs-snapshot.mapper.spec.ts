import {
  InvalidTempleOsrsSnapshotError,
  normalizeTempleOsrsSnapshot,
} from "./templeosrs-snapshot.mapper";

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
    killcounts: {
      kraken: { kc: 150 },
      zulrah: { kc: 0 },
    },
  },
};

describe("normalizeTempleOsrsSnapshot", () => {
  it("maps TempleOSRS snapshot metadata, items, and killcounts", () => {
    expect(normalizeTempleOsrsSnapshot(payload)).toEqual({
      source: "templeosrs",
      username: "Techdad69",
      playerNameWithCapitalization: null,
      gameMode: 0,
      lastChecked: "2026-06-26 01:58:46",
      lastChanged: "2026-06-26 01:58:46",
      items: {
        "13262": { count: 0, itemDate: null, missingHours: 37.7111 },
        "4151": { count: 2, itemDate: 1782439126, hours: 0 },
      },
      killcounts: {
        kraken: { kc: 150 },
        zulrah: { kc: 0 },
      },
    });
  });

  it("rejects malformed item entries", () => {
    expect(() =>
      normalizeTempleOsrsSnapshot({
        data: { ...payload.data, items: { abc: { count: 1 } } },
      }),
    ).toThrow(InvalidTempleOsrsSnapshotError);
  });
});
