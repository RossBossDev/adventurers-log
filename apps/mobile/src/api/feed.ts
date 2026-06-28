import { buildApiUrl } from "../config/api";

export type FeedEvent = {
  id: string;
  trackedPlayerId: string;
  accountName: string;
  type:
    | "skill_level_up"
    | "total_level_milestone"
    | "new_log_item"
    | "quest_complete"
    | "diary_complete";
  occurredAt: string;
  display: {
    title: string;
    body: string | null;
    accentLabel: string;
  };
  subject: {
    type: "skill" | "overall" | "item" | "quest" | "diary";
    key: string;
    label: string;
  };
  values: {
    from: number | null;
    to: number | null;
    milestone: number | null;
  };
};

export type FeedEventsResponse = {
  events: FeedEvent[];
  nextCursor: string | null;
};

export type FetchFeedEventsInput = {
  trackedPlayerIds: string[];
  cursor?: string | null;
};

export async function fetchFeedEvents({
  trackedPlayerIds,
  cursor,
}: FetchFeedEventsInput): Promise<FeedEventsResponse> {
  if (trackedPlayerIds.length === 0) {
    return { events: [], nextCursor: null };
  }

  const params = new URLSearchParams({
    trackedPlayerIds: trackedPlayerIds.join(","),
  });

  if (cursor) {
    params.set("cursor", cursor);
  }

  const response = await fetch(buildApiUrl(`/api/feed/events?${params}`));

  if (!response.ok) {
    throw new Error(`Could not load feed events (${response.status}).`);
  }

  return response.json() as Promise<FeedEventsResponse>;
}
