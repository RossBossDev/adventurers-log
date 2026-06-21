import { Inject, Injectable } from "@nestjs/common";
import { HealthCheckError, type HealthIndicatorResult } from "@nestjs/terminus";
import type { Pool } from "pg";
import { PG_POOL } from "../database/database.tokens";

@Injectable()
export class DatabaseHealthIndicator {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.pool.query("select 1");
      return { [key]: { status: "up" } };
    } catch (error) {
      throw new HealthCheckError("Database health check failed", {
        [key]: { status: "down", error },
      });
    }
  }
}
