import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const trackedPlayers = sqliteTable("tracked_players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  backendId: text("backend_id").notNull().unique(),
  normalizedUsername: text("normalized_username").notNull().unique(),
  displayName: text("display_name").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type TrackedPlayerRow = typeof trackedPlayers.$inferSelect;
export type NewTrackedPlayerRow = typeof trackedPlayers.$inferInsert;
