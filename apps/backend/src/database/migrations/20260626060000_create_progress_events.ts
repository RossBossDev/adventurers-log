import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`create extension if not exists pgcrypto`.execute(db);

  await db.schema
    .createTable("progress_events")
    .addColumn("id", "uuid", (column) =>
      column.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("tracked_player_id", "uuid", (column) =>
      column.notNull().references("tracked_players.id").onDelete("cascade"),
    )
    .addColumn("previous_player_snapshot_id", "uuid", (column) =>
      column.references("player_snapshots.id").onDelete("set null"),
    )
    .addColumn("current_player_snapshot_id", "uuid", (column) =>
      column.notNull().references("player_snapshots.id").onDelete("cascade"),
    )
    .addColumn("event_type", "text", (column) => column.notNull())
    .addColumn("subject_type", "text", (column) => column.notNull())
    .addColumn("subject_key", "text", (column) => column.notNull())
    .addColumn("from_value", "integer")
    .addColumn("to_value", "integer", (column) => column.notNull())
    .addColumn("milestone_value", "integer")
    .addColumn("occurred_at", "timestamptz", (column) => column.notNull())
    .addColumn("idempotency_key", "text", (column) => column.notNull().unique())
    .addColumn("metadata", "jsonb", (column) =>
      column.notNull().defaultTo(sql`'{}'::jsonb`),
    )
    .addColumn("created_at", "timestamptz", (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await sql`create index progress_events_tracked_occurred_at_idx on progress_events (tracked_player_id, occurred_at desc)`.execute(
    db,
  );

  await sql`create index progress_events_type_occurred_at_idx on progress_events (event_type, occurred_at desc)`.execute(
    db,
  );
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("progress_events").execute();
}
