import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`create extension if not exists pgcrypto`.execute(db);

  await db.schema
    .createTable("raw_player_snapshots")
    .addColumn("id", "uuid", (column) =>
      column.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("tracked_player_id", "uuid", (column) =>
      column.notNull().references("tracked_players.id").onDelete("cascade"),
    )
    .addColumn("source", "text", (column) => column.notNull())
    .addColumn("source_username", "text", (column) => column.notNull())
    .addColumn("fetched_at", "timestamptz", (column) => column.notNull())
    .addColumn("http_status", "integer")
    .addColumn("cached", "boolean")
    .addColumn("raw_payload", "jsonb", (column) => column.notNull())
    .addColumn("created_at", "timestamptz", (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await sql`create index raw_player_snapshots_tracked_source_fetched_at_idx on raw_player_snapshots (tracked_player_id, source, fetched_at desc)`.execute(
    db,
  );

  await sql`create index raw_player_snapshots_source_fetched_at_idx on raw_player_snapshots (source, fetched_at desc)`.execute(
    db,
  );

  await db.schema
    .createTable("player_snapshots")
    .addColumn("id", "uuid", (column) =>
      column.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("tracked_player_id", "uuid", (column) =>
      column.notNull().references("tracked_players.id").onDelete("cascade"),
    )
    .addColumn("raw_player_snapshot_id", "uuid", (column) =>
      column
        .notNull()
        .references("raw_player_snapshots.id")
        .onDelete("cascade"),
    )
    .addColumn("source", "text", (column) => column.notNull())
    .addColumn("fetched_at", "timestamptz", (column) => column.notNull())
    .addColumn("normalized", "jsonb", (column) => column.notNull())
    .addColumn("created_at", "timestamptz", (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await sql`create index player_snapshots_tracked_fetched_at_idx on player_snapshots (tracked_player_id, fetched_at desc)`.execute(
    db,
  );

  await sql`create index player_snapshots_tracked_source_fetched_at_idx on player_snapshots (tracked_player_id, source, fetched_at desc)`.execute(
    db,
  );
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("player_snapshots").execute();
  await db.schema.dropTable("raw_player_snapshots").execute();
}
