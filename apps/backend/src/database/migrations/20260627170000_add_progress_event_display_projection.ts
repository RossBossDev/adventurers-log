import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("progress_events")
    .addColumn("display_title", "text")
    .addColumn("display_body", "text")
    .addColumn("display_accent_label", "text")
    .addColumn("subject_label", "text")
    .execute();

  await sql`
    update progress_events
    set
      display_accent_label = case
        when event_type = 'skill_level_up' then 'Skill'
        when event_type = 'total_level_milestone' then 'Total level'
        when event_type = 'new_log_item' then 'Collection log'
        else 'Activity'
      end,
      subject_label = case
        when subject_type = 'overall' then 'Overall'
        when event_type = 'new_log_item' then 'item #' || subject_key
        else initcap(replace(replace(subject_key, '_', ' '), '-', ' '))
      end,
      display_title = case
        when event_type = 'skill_level_up' then 'reached ' || to_value || ' ' || replace(replace(subject_key, '_', ' '), '-', ' ')
        when event_type = 'total_level_milestone' then 'reached ' || coalesce(milestone_value, to_value) || ' total level'
        when event_type = 'new_log_item' then 'added item #' || subject_key || ' to the collection log'
        else 'recorded activity'
      end,
      display_body = null
  `.execute(db);

  await db.schema
    .alterTable("progress_events")
    .alterColumn("display_title", (column) => column.setNotNull())
    .alterColumn("display_accent_label", (column) => column.setNotNull())
    .alterColumn("subject_label", (column) => column.setNotNull())
    .execute();

  await sql`create index progress_events_feed_idx on progress_events (tracked_player_id, occurred_at desc, id desc)`.execute(
    db,
  );
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`drop index if exists progress_events_feed_idx`.execute(db);
  await db.schema
    .alterTable("progress_events")
    .dropColumn("display_title")
    .dropColumn("display_body")
    .dropColumn("display_accent_label")
    .dropColumn("subject_label")
    .execute();
}
