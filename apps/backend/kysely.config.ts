import { defineConfig } from "kysely-ctl";
import { Pool } from "pg";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  dialect: "pg",
  dialectConfig: {
    pool: new Pool({
      connectionString:
        process.env.DATABASE_URL ??
        "postgres://postgres:postgres@localhost:5432/app",
    }),
  },
  migrations: {
    migrationFolder: isProd
      ? "dist/src/database/migrations"
      : "src/database/migrations",
    allowJS: isProd,
  },
});
