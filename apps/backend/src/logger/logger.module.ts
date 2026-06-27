import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";
import type { AppConfig } from "../config/app.config";

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        return {
          pinoHttp: {
            level: configService.get("LOG_LEVEL", { infer: true }),
            redact: [
              "req.headers.authorization",
              "req.headers.cookie",
              "res.headers.set-cookie",
            ],
            transport: {
              target: "pino-pretty",
              options: { colorize: true, singleLine: true },
            },
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
