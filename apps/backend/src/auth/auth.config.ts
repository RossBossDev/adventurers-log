import type { ConfigurableModuleAsyncOptions } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Auth } from "better-auth";
import type { Pool } from "pg";
import type { AppConfig } from "../config/app.config";
import { DatabaseModule } from "../database/database.module";
import { PG_POOL } from "../database/database.tokens";
import { createAuthInstance } from "./auth";

export const authModuleAsyncConfig: ConfigurableModuleAsyncOptions<
  { auth: Auth },
  "create"
> = {
  imports: [DatabaseModule],
  inject: [ConfigService, PG_POOL],
  useFactory: async (config: ConfigService<AppConfig, true>, pool: Pool) => ({
    auth: await createAuthInstance(config, pool),
    bodyParser: {
      json: { limit: "2mb" },
      urlencoded: { limit: "2mb", extended: true },
    },
  }),
};
