import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("osrs_items")
    .addColumn("id", "integer", (column) => column.primaryKey())
    .addColumn("name", "text", (column) => column.notNull())
    .addColumn("examine", "text")
    .addColumn("icon", "text")
    .addColumn("members", "boolean")
    .addColumn("raw_mapping", "jsonb", (column) => column.notNull())
    .addColumn("updated_at", "timestamptz", (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await sql`create index osrs_items_updated_at_idx on osrs_items (updated_at desc)`.execute(
    db,
  );
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("osrs_items").execute();
}
