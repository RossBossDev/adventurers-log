import { Inject, Injectable } from "@nestjs/common";
import { type Kysely, sql } from "kysely";
import { KYSELY_DB } from "../database/database.tokens";
import type { DB } from "../database/database.types";
import type { FeedEvent, FeedEventCursor } from "./feed.types";

const PAGE_SIZE = 25;

export type ListFeedEventsInput = {
  trackedPlayerIds: string[];
  cursor: FeedEventCursor | null;
};

export type ListFeedEventsResult = {
  events: FeedEvent[];
  nextCursor: string | null;
};

@Injectable()
export class FeedEventStoreService {
  constructor(@Inject(KYSELY_DB) private readonly db: Kysely<DB>) {}

  async listEvents({
    trackedPlayerIds,
    cursor,
  }: ListFeedEventsInput): Promise<ListFeedEventsResult> {
    if (trackedPlayerIds.length === 0) {
      return { events: [], nextCursor: null };
    }

    let query = this.db
      .selectFrom("progress_events")
      .innerJoin(
        "tracked_players",
        "tracked_players.id",
        "progress_events.tracked_player_id",
      )
      .select([
        "progress_events.id as id",
        "progress_events.tracked_player_id as trackedPlayerId",
        "tracked_players.normalized_username as accountName",
        "progress_events.event_type as type",
        "progress_events.occurred_at as occurredAt",
        "progress_events.display_title as displayTitle",
        "progress_events.display_body as displayBody",
        "progress_events.display_accent_label as displayAccentLabel",
        "progress_events.subject_type as subjectType",
        "progress_events.subject_key as subjectKey",
        "progress_events.subject_label as subjectLabel",
        "progress_events.from_value as fromValue",
        "progress_events.to_value as toValue",
        "progress_events.milestone_value as milestoneValue",
      ])
      .where("progress_events.tracked_player_id", "in", trackedPlayerIds);

    if (cursor) {
      query = query.where(sql<boolean>`(
        progress_events.occurred_at,
        progress_events.id
      ) < (${cursor.occurredAt}, ${cursor.id}::uuid)`);
    }

    const rows = await query
      .orderBy("progress_events.occurred_at", "desc")
      .orderBy("progress_events.id", "desc")
      .limit(PAGE_SIZE + 1)
      .execute();

    const pageRows = rows.slice(0, PAGE_SIZE);
    const last = pageRows.at(-1);

    return {
      events: pageRows.map((row) => ({
        id: row.id,
        trackedPlayerId: row.trackedPlayerId,
        accountName: row.accountName,
        type: row.type as FeedEvent["type"],
        occurredAt: new Date(row.occurredAt).toISOString(),
        display: {
          title: row.displayTitle,
          body: row.displayBody,
          accentLabel: row.displayAccentLabel,
        },
        subject: {
          type: row.subjectType as FeedEvent["subject"]["type"],
          key: row.subjectKey,
          label: row.subjectLabel,
        },
        values: {
          from: row.fromValue,
          to: row.toValue,
          milestone: row.milestoneValue,
        },
      })),
      nextCursor:
        rows.length > PAGE_SIZE && last
          ? encodeFeedEventCursor({
              occurredAt: new Date(last.occurredAt).toISOString(),
              id: last.id,
            })
          : null,
    };
  }
}

export function encodeFeedEventCursor(cursor: FeedEventCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}
