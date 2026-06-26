import { parseCanonicalPlayerSnapshot } from "./canonical-player-snapshot.validate";

describe("parseCanonicalPlayerSnapshot", () => {
  it("returns a canonical snapshot for the expected shape", () => {
    expect(
      parseCanonicalPlayerSnapshot({
        overall: { level: 2000, xp: 100_000_000 },
        skills: { slayer: { level: 90, xp: 5_000_000 } },
        itemsUnlocked: { "4151": { id: 4151, acquiredAt: null } },
        bosses: { kraken: { count: 100 } },
      }),
    ).toEqual({
      overall: { level: 2000, xp: 100_000_000 },
      skills: { slayer: { level: 90, xp: 5_000_000 } },
      itemsUnlocked: { "4151": { id: 4151, acquiredAt: null } },
      bosses: { kraken: { count: 100 } },
    });
  });

  it("returns null when required canonical collections are missing", () => {
    expect(
      parseCanonicalPlayerSnapshot({
        overall: { level: 2000, xp: 100_000_000 },
        skills: { slayer: { level: 90, xp: 5_000_000 } },
      }),
    ).toBeNull();
  });

  it("returns null when nested values do not match the canonical schema", () => {
    expect(
      parseCanonicalPlayerSnapshot({
        skills: { slayer: { level: "90" } },
        itemsUnlocked: {},
        bosses: {},
      }),
    ).toBeNull();
  });
});
