jest.mock("@thallesp/nestjs-better-auth", () => ({
  AllowAnonymous: () => () => undefined,
}));

jest.mock("./feed-event-store.service", () => ({
  FeedEventStoreService: class FeedEventStoreService {},
}));

import {
  FeedController,
  parseCursor,
  parseTrackedPlayerIds,
} from "./feed.controller";

const firstId = "11111111-1111-4111-8111-111111111111";
const secondId = "22222222-2222-4222-8222-222222222222";

describe("FeedController parsing", () => {
  it("returns no IDs when missing", () => {
    expect(parseTrackedPlayerIds(undefined)).toEqual([]);
  });

  it("returns no IDs when malformed", () => {
    expect(parseTrackedPlayerIds("not-a-uuid")).toEqual([]);
  });

  it("parses comma-separated UUIDs", () => {
    expect(parseTrackedPlayerIds(`${firstId}, ${secondId}`)).toEqual([
      firstId,
      secondId,
    ]);
  });

  it("returns no IDs when the cap is exceeded", () => {
    expect(
      parseTrackedPlayerIds(
        Array.from({ length: 51 }, () => firstId).join(","),
      ),
    ).toEqual([]);
  });

  it("ignores malformed cursors", () => {
    expect(parseCursor("not-json")).toBeNull();
  });
});

describe("FeedController", () => {
  it("returns an empty response for missing IDs", async () => {
    const store = { listEvents: jest.fn() };
    const controller = new FeedController(store as never);

    await expect(controller.listEvents(undefined, undefined)).resolves.toEqual({
      events: [],
      nextCursor: null,
    });
    expect(store.listEvents).not.toHaveBeenCalled();
  });

  it("passes valid IDs and ignores malformed cursor", async () => {
    const store = {
      listEvents: jest.fn().mockResolvedValue({ events: [], nextCursor: null }),
    };
    const controller = new FeedController(store as never);

    await controller.listEvents(firstId, "malformed");

    expect(store.listEvents).toHaveBeenCalledWith({
      trackedPlayerIds: [firstId],
      cursor: null,
    });
  });
});
