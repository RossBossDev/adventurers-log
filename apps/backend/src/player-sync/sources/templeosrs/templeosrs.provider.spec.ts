import type { ConfigService } from "@nestjs/config";
import type { AppConfig } from "../../../config/app.config";
import {
  TempleOsrsProvider,
  TempleOsrsProviderError,
} from "./templeosrs.provider";

function createProvider(baseUrl = "https://templeosrs.com") {
  return new TempleOsrsProvider({
    get: jest.fn().mockReturnValue(baseUrl),
  } as unknown as ConfigService<AppConfig, true>);
}

describe("TempleOsrsProvider", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it("fetches and returns TempleOSRS collection-log payload metadata", async () => {
    const payload = {
      data: {
        player: "Techdad69",
        last_checked: "2026-06-26 01:58:46",
        items: { "13262": { count: 0, item_date: null } },
      },
    };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    });

    await expect(
      createProvider().fetchCollectionLog("techdad69"),
    ).resolves.toEqual({
      source: "templeosrs_collection_log",
      sourceUsername: "Techdad69",
      fetchedAt: new Date("2026-06-26 01:58:46 UTC"),
      httpStatus: 200,
      rawPayload: payload,
      collectionPayload: payload,
    });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://templeosrs.com/api/collection-log/player_collections.php?player=techdad69",
    );
    expect(fetchMock.mock.calls[0][1]).toEqual({
      headers: { "user-agent": "adventurers-log/0.1" },
    });
  });

  it("rejects non-2xx responses", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
    });

    await expect(
      createProvider().fetchCollectionLog("missing"),
    ).rejects.toThrow(TempleOsrsProviderError);
  });

  it("rejects malformed responses", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: {} }),
    });

    await expect(
      createProvider().fetchCollectionLog("missing"),
    ).rejects.toThrow("TempleOSRS response did not include items.");
  });
});
