import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import type { FeedEventCursor, FeedEventsResponse } from "./feed.types";
import { FeedEventStoreService } from "./feed-event-store.service";

const MAX_TRACKED_PLAYER_IDS = 50;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@ApiTags("feed")
@Controller("feed")
export class FeedController {
  constructor(
    @Inject(FeedEventStoreService)
    private readonly feedEvents: FeedEventStoreService,
  ) {}

  @Get("events")
  @AllowAnonymous()
  @ApiQuery({ name: "trackedPlayerIds", required: false })
  @ApiQuery({ name: "cursor", required: false })
  @ApiOkResponse({ description: "Recent activity events for tracked players." })
  async listEvents(
    @Query("trackedPlayerIds") trackedPlayerIds?: string,
    @Query("cursor") cursor?: string,
  ): Promise<FeedEventsResponse> {
    const ids = parseTrackedPlayerIds(trackedPlayerIds);

    if (ids.length === 0) {
      return { events: [], nextCursor: null };
    }

    return this.feedEvents.listEvents({
      trackedPlayerIds: ids,
      cursor: parseCursor(cursor),
    });
  }
}

export function parseTrackedPlayerIds(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0 || parts.length > MAX_TRACKED_PLAYER_IDS) {
    return [];
  }

  const validIds = parts.filter((part) => UUID_PATTERN.test(part));

  if (validIds.length !== parts.length) {
    return [];
  }

  return [...new Set(validIds)];
}

export function parseCursor(value: string | undefined): FeedEventCursor | null {
  if (!value) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as {
      occurredAt?: unknown;
      id?: unknown;
    };

    if (
      typeof decoded.occurredAt !== "string" ||
      Number.isNaN(new Date(decoded.occurredAt).getTime()) ||
      typeof decoded.id !== "string" ||
      !UUID_PATTERN.test(decoded.id)
    ) {
      return null;
    }

    return { occurredAt: decoded.occurredAt, id: decoded.id };
  } catch {
    return null;
  }
}
