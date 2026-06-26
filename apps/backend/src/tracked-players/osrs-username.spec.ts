import {
  InvalidOsrsUsernameError,
  normalizeOsrsUsername,
} from "./osrs-username";

describe("normalizeOsrsUsername", () => {
  it.each([
    ["Mad Mech", "mad mech"],
    ["mad_mech", "mad mech"],
    ["  MAD   MECH  ", "mad mech"],
    ["Zezima", "zezima"],
  ])("normalizes %p to %p", (input, expected) => {
    expect(normalizeOsrsUsername(input)).toBe(expected);
  });

  it("treats case, underscores, and repeated spacing as one canonical username", () => {
    const variants = ["Mad Mech", "mad_mech", "  MAD   MECH  "];

    expect(variants.map(normalizeOsrsUsername)).toEqual([
      "mad mech",
      "mad mech",
      "mad mech",
    ]);
  });

  it.each([
    "",
    "   ",
    "bad!name",
    "thirteenchars1",
  ])("rejects invalid username %p", (input) => {
    expect(() => normalizeOsrsUsername(input)).toThrow(
      InvalidOsrsUsernameError,
    );
  });
});
