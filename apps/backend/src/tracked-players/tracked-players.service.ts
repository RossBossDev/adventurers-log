import { Inject, Injectable } from "@nestjs/common";
import type { Kysely, Selectable } from "kysely";
import { KYSELY_DB } from "../database/database.tokens";
import type { DB, TrackedPlayers } from "../database/database.types";
import {
  normalizeOsrsUsername,
  UntrackableOsrsUsernameError,
} from "./osrs-username";

export type TrackedPlayer = Selectable<TrackedPlayers>;

@Injectable()
export class TrackedPlayersService {
  constructor(@Inject(KYSELY_DB) private readonly db: Kysely<DB>) {}

  async findOrCreateByUsername(username: string): Promise<TrackedPlayer> {
    const normalizedUsername = normalizeOsrsUsername(username);

    await ensureUsernameIsTrackable(normalizedUsername);

    try {
      return await this.db
        .insertInto("tracked_players")
        .values({ normalized_username: normalizedUsername })
        .returningAll()
        .executeTakeFirstOrThrow();
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }

      return this.db
        .selectFrom("tracked_players")
        .selectAll()
        .where("normalized_username", "=", normalizedUsername)
        .executeTakeFirstOrThrow();
    }
  }
}

async function ensureUsernameIsTrackable(username: string): Promise<void> {
  const params = new URLSearchParams({ user1: username });
  const response = await fetch(
    `https://secure.runescape.com/m=hiscore_oldschool/hiscorepersonal?${params}`,
  );
  const body = await response.text();

  if (body.includes("No player <b>")) {
    throw new UntrackableOsrsUsernameError(username);
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
