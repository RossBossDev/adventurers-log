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

export type FeedEventCursor = {
  occurredAt: string;
  id: string;
};
