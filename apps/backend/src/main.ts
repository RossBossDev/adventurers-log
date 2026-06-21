import "reflect-metadata";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import type { AppConfig } from "./config/app.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableCors();

  const configService = app.get<ConfigService<AppConfig, true>>(ConfigService);

  if (configService.get("NODE_ENV", { infer: true }) !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Adventurers' Log API")
      .setDescription(
        "Backend API for the OSRS activity tracker and companion app.",
      )
      .setVersion("0.0.0")
      .build();
    SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, config));
  }

  await app.listen(configService.get("PORT", { infer: true }));
}

void bootstrap();
