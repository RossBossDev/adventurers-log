import { Controller, Get, Inject } from "@nestjs/common";
import {
  HealthCheck,
  type HealthCheckResult,
  HealthCheckService,
} from "@nestjs/terminus";
import { DatabaseHealthIndicator } from "./database-health.indicator";

@Controller("health")
export class HealthController {
  constructor(
    @Inject(HealthCheckService) private readonly health: HealthCheckService,
    @Inject(DatabaseHealthIndicator)
    private readonly database: DatabaseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.database.isHealthy("database")]);
  }
}
