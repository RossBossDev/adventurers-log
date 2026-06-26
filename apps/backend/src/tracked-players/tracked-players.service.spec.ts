import type { Kysely } from "kysely";
import type { DB } from "../database/database.types";
import { TrackedPlayersService } from "./tracked-players.service";

const UNIQUE_VIOLATION = "23505";
const fetchMock = jest.fn<Promise<Pick<Response, "text">>, [string]>();

type StoredTrackedPlayer = {
  id: string;
  normalized_username: string;
  created_at: Date;
  updated_at: Date;
};

class FakeTrackedPlayersDb {
  private rows = new Map<string, StoredTrackedPlayer>();
  private nextId = 1;

  insertInto(table: string) {
    expect(table).toBe("tracked_players");

    return {
      values: ({ normalized_username }: { normalized_username: string }) => ({
        returningAll: () => ({
          executeTakeFirstOrThrow: async () => {
            if (this.rows.has(normalized_username)) {
              throw Object.assign(new Error("duplicate tracked player"), {
                code: UNIQUE_VIOLATION,
              });
            }

            const now = new Date("2026-06-23T00:00:00.000Z");
            const row = {
              id: `tracked-player-${this.nextId++}`,
              normalized_username,
              created_at: now,
              updated_at: now,
            };
            this.rows.set(normalized_username, row);
            return row;
          },
        }),
      }),
    };
  }

  selectFrom(table: string) {
    expect(table).toBe("tracked_players");

    return {
      selectAll: () => ({
        where: (
          column: string,
          operator: string,
          normalizedUsername: string,
        ) => ({
          executeTakeFirstOrThrow: async () => {
            expect(column).toBe("normalized_username");
            expect(operator).toBe("=");
            const row = this.rows.get(normalizedUsername);

            if (!row) {
              throw new Error("tracked player not found");
            }

            return row;
          },
        }),
      }),
    };
  }
}

describe("TrackedPlayersService", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ text: async () => "player hiscore page" });
    jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(fetchMock as typeof fetch);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates a tracked player using the normalized username", async () => {
    const service = new TrackedPlayersService(
      new FakeTrackedPlayersDb() as unknown as Kysely<DB>,
    );

    await expect(service.findOrCreateByUsername("Mad Mech")).resolves.toEqual(
      expect.objectContaining({ normalized_username: "mad mech" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://secure.runescape.com/m=hiscore_oldschool/hiscorepersonal?user1=mad+mech",
    );
  });

  it("returns the existing tracked player for case, underscore, and spacing variants", async () => {
    const service = new TrackedPlayersService(
      new FakeTrackedPlayersDb() as unknown as Kysely<DB>,
    );

    const first = await service.findOrCreateByUsername("Mad Mech");
    const second = await service.findOrCreateByUsername("mad_mech");
    const third = await service.findOrCreateByUsername("  MAD   MECH  ");

    expect(second).toEqual(first);
    expect(third).toEqual(first);
  });

  it("rejects invalid usernames before inserting", async () => {
    const db = new FakeTrackedPlayersDb();
    const insertSpy = jest.spyOn(db, "insertInto");
    const service = new TrackedPlayersService(db as unknown as Kysely<DB>);

    await expect(service.findOrCreateByUsername("bad!name")).rejects.toThrow(
      "OSRS username may only contain letters, digits, spaces, or underscores.",
    );
    expect(insertSpy).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects usernames missing from the OSRS hiscores before inserting", async () => {
    fetchMock.mockResolvedValue({
      text: async () => "No player <b>missing</b>",
    });
    const db = new FakeTrackedPlayersDb();
    const insertSpy = jest.spyOn(db, "insertInto");
    const service = new TrackedPlayersService(db as unknown as Kysely<DB>);

    await expect(service.findOrCreateByUsername("missing")).rejects.toThrow(
      'OSRS username "missing" is not available to be tracked.',
    );
    expect(insertSpy).not.toHaveBeenCalled();
  });
});
