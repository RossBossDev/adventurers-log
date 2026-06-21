import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { AppConfig } from "../config/app.config";
import { DatabaseShutdown } from "./database.shutdown";
import { KYSELY_DB, PG_POOL } from "./database.tokens";
import type { DB } from "./database.types";

@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) =>
        new Pool({
          connectionString: configService.get("DATABASE_URL", { infer: true }),
        }),
    },
    {
      provide: KYSELY_DB,
      inject: [PG_POOL],
      useFactory: (pool: Pool) =>
        new Kysely<DB>({
          dialect: new PostgresDialect({ pool }),
        }),
    },
    DatabaseShutdown,
  ],
  exports: [PG_POOL, KYSELY_DB],
})
export class DatabaseModule {}
