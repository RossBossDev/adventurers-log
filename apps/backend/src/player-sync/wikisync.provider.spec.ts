import type { ConfigService } from "@nestjs/config";
import type { AppConfig } from "../config/app.config";
import { WikiSyncProvider, WikiSyncProviderError } from "./wikisync.provider";

const fetchMock = jest.fn<
  Promise<Pick<Response, "json" | "ok" | "status">>,
  [URL]
>();

function createProvider(baseUrl = "https://api.wikisync.net") {
  return new WikiSyncProvider({
    get: jest.fn().mockReturnValue(baseUrl),
  } as unknown as ConfigService<AppConfig, true>);
}

describe("WikiSyncProvider", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(fetchMock as unknown as typeof fetch);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches and returns WikiSync player payload metadata", async () => {
    const payload = {
      ok: true,
      count: 1,
      players: [
        {
          ok: true,
          username: "techdad69",
          fetchedAt: "2026-06-26T03:07:34.349Z",
          cached: false,
        },
      ],
    };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    });

    await expect(createProvider().fetchPlayer("techdad69")).resolves.toEqual({
      source: "wikisync",
      sourceUsername: "techdad69",
      fetchedAt: new Date("2026-06-26T03:07:34.349Z"),
      httpStatus: 200,
      cached: false,
      rawPayload: payload,
      playerPayload: payload.players[0],
    });
    expect(fetchMock.mock.calls[0]?.[0].toString()).toBe(
      "https://api.wikisync.net/api/players?usernames=techdad69",
    );
  });

  it("uses the configured base URL", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        players: [{ ok: true, username: "zezima" }],
      }),
    });

    await createProvider("http://localhost:8080").fetchPlayer("zezima");

    expect(fetchMock.mock.calls[0]?.[0].toString()).toBe(
      "http://localhost:8080/api/players?usernames=zezima",
    );
  });

  it("rejects non-2xx responses", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ ok: false }),
    });

    await expect(createProvider().fetchPlayer("zezima")).rejects.toThrow(
      WikiSyncProviderError,
    );
  });

  it("rejects responses without a synced player", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, count: 0, players: [] }),
    });

    await expect(createProvider().fetchPlayer("missing")).rejects.toThrow(
      "WikiSync did not return a synced player.",
    );
  });
});
