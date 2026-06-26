import { desc, eq } from "drizzle-orm";

import { db } from "./client";
import { type TrackedPlayerRow, trackedPlayers } from "./schema";

export type LocalTrackedPlayer = TrackedPlayerRow;

export type UpsertTrackedPlayerInput = {
  backendId: string;
  normalizedUsername: string;
  displayName: string;
};

export async function listTrackedPlayers(): Promise<LocalTrackedPlayer[]> {
  return db
    .select()
    .from(trackedPlayers)
    .orderBy(desc(trackedPlayers.updatedAt));
}

export async function upsertTrackedPlayer(
  input: UpsertTrackedPlayerInput,
): Promise<LocalTrackedPlayer> {
  const now = new Date().toISOString();

  await db
    .insert(trackedPlayers)
    .values({
      backendId: input.backendId,
      normalizedUsername: input.normalizedUsername,
      displayName: input.displayName,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: trackedPlayers.backendId,
      set: {
        normalizedUsername: input.normalizedUsername,
        displayName: input.displayName,
        updatedAt: now,
      },
    });

  const row = await db
    .select()
    .from(trackedPlayers)
    .where(eq(trackedPlayers.backendId, input.backendId))
    .limit(1);

  const trackedPlayer = row[0];

  if (!trackedPlayer) {
    throw new Error("Tracked player was not saved locally.");
  }

  return trackedPlayer;
}

export async function removeTrackedPlayer(id: number): Promise<void> {
  await db.delete(trackedPlayers).where(eq(trackedPlayers.id, id));
}
