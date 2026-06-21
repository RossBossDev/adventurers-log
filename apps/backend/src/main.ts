import "reflect-metadata";
import { join } from "node:path";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  ExpressAdapter,
  type NestExpressApplication,
} from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import express, { type Request, type Response } from "express";
import { Logger } from "nestjs-pino";
import Next from "next";
import { AppModule } from "./app.module";
import type { AppConfig } from "./config/app.config";

async function bootstrap() {
  const nestExpress = express();
  const adapter = new ExpressAdapter(nestExpress);
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    adapter,
    { bufferLogs: true },
  );
  // biome-ignore lint/correctness/useHookAtTopLevel: Nest's useLogger method is not a React hook.
  app.useLogger(app.get(Logger));
  app.enableCors();
  app.setGlobalPrefix("api");

  const configService = app.get<ConfigService<AppConfig, true>>(ConfigService);
  const nodeEnv = configService.get("NODE_ENV", { infer: true });

  if (nodeEnv !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Adventurers' Log API")
      .setDescription(
        "Backend API for the OSRS activity tracker and companion app.",
      )
      .setVersion("0.0.0")
      .build();
    SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, config));
  }

  const nextApp = Next({
    dev: nodeEnv !== "production",
    dir: join(__dirname, "../../../web"),
  });
  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  nestExpress.all(/^(?!\/api).*/, (req: Request, res: Response) =>
    handle(req, res),
  );

  await app.listen(configService.get("PORT", { infer: true }));
}

void bootstrap();
