import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { authModuleAsyncConfig } from "./auth/auth.config";
import { ConfigModule } from "./config/config.module";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { LoggerModule } from "./logger/logger.module";
import { QueueModule } from "./queue/queue.module";
import { TrackedPlayersModule } from "./tracked-players/tracked-players.module";

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    AuthModule.forRootAsync(authModuleAsyncConfig),
    QueueModule,
    HealthModule,
    TrackedPlayersModule,
  ],
})
export class AppModule {}
