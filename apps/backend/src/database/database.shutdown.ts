import { Inject, Injectable, type OnApplicationShutdown } from "@nestjs/common";
import type { Kysely } from "kysely";
import type { Pool } from "pg";
import { KYSELY_DB, PG_POOL } from "./database.tokens";
import type { DB } from "./database.types";

@Injectable()
export class DatabaseShutdown implements OnApplicationShutdown {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(KYSELY_DB) private readonly db: Kysely<DB>,
  ) {}

  async onApplicationShutdown() {
    await this.db.destroy();
    await this.pool.end();
  }
}
