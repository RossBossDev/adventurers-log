import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`create index player_snapshots_tracked_created_at_idx on player_snapshots (tracked_player_id, created_at desc)`.execute(
    db,
  );
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`drop index if exists player_snapshots_tracked_created_at_idx`.execute(
    db,
  );
}
