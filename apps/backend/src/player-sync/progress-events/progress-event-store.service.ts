import { Inject, Injectable } from "@nestjs/common";
import type { Insertable, Kysely, Transaction } from "kysely";
import { KYSELY_DB } from "../../database/database.tokens";
import type { DB, Json, ProgressEvents } from "../../database/database.types";
import type { ProgressEventCandidate } from "./progress-event.types";

@Injectable()
export class ProgressEventStoreService {
  constructor(@Inject(KYSELY_DB) private readonly db: Kysely<DB>) {}

  async insertEvents(events: ProgressEventCandidate[]): Promise<number> {
    return this.insertEventsWithDb(this.db, events);
  }

  async insertEventsWithDb(
    db: Kysely<DB> | Transaction<DB>,
    events: ProgressEventCandidate[],
  ): Promise<number> {
    if (events.length === 0) {
      return 0;
    }

    const inserted = await db
      .insertInto("progress_events")
      .values(events.map(toProgressEventInsert))
      .onConflict((oc) => oc.column("idempotency_key").doNothing())
      .returning("id")
      .execute();

    return inserted.length;
  }
}

function toProgressEventInsert(
  event: ProgressEventCandidate,
): Insertable<ProgressEvents> {
  return {
    tracked_player_id: event.trackedPlayerId,
    previous_player_snapshot_id: event.previousPlayerSnapshotId,
    current_player_snapshot_id: event.currentPlayerSnapshotId,
    event_type: event.eventType,
    subject_type: event.subjectType,
    subject_key: event.subjectKey,
    from_value: event.fromValue,
    to_value: event.toValue,
    milestone_value: event.milestoneValue,
    occurred_at: event.occurredAt,
    idempotency_key: event.idempotencyKey,
    metadata: event.metadata as Json,
  };
}
