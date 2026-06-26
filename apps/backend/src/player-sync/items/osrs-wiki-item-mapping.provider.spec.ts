import type { ConfigService } from "@nestjs/config";
import type { AppConfig } from "../../config/app.config";
import {
  OsrsWikiItemMappingProvider,
  OsrsWikiItemMappingProviderError,
} from "./osrs-wiki-item-mapping.provider";

function createProvider(baseUrl = "https://prices.runescape.wiki") {
  return new OsrsWikiItemMappingProvider({
    get: jest.fn().mockReturnValue(baseUrl),
  } as unknown as ConfigService<AppConfig, true>);
}

describe("OsrsWikiItemMappingProvider", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it("fetches and maps OSRS Wiki item metadata", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 4151,
          name: "Abyssal whip",
          examine: "A weapon from the abyss.",
          icon: "Abyssal whip.png",
          members: true,
          value: 120001,
        },
      ],
    });

    await expect(createProvider().fetchItems()).resolves.toEqual([
      {
        id: 4151,
        name: "Abyssal whip",
        examine: "A weapon from the abyss.",
        icon: "Abyssal whip.png",
        members: true,
        raw: {
          id: 4151,
          name: "Abyssal whip",
          examine: "A weapon from the abyss.",
          icon: "Abyssal whip.png",
          members: true,
          value: 120001,
        },
      },
    ]);
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://prices.runescape.wiki/api/v1/osrs/mapping",
    );
    expect(fetchMock.mock.calls[0][1]).toEqual({
      headers: { "user-agent": "adventurers-log/0.1" },
    });
  });

  it("rejects malformed mapping entries", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ id: "4151" }],
    });

    await expect(createProvider().fetchItems()).rejects.toThrow(
      OsrsWikiItemMappingProviderError,
    );
  });
});
