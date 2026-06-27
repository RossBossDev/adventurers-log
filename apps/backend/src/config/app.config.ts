import { plainToInstance, Type } from "class-transformer";
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from "class-validator";

export type NodeEnv = "development" | "test" | "production";

export interface AppConfig {
  NODE_ENV: NodeEnv;
  PORT: number;
  DATABASE_URL: string;
  LOG_LEVEL: string;
  REDIS_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_TRUSTED_ORIGINS: string;
  AUTH_EMAIL_FROM: string;
  RESEND_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_IOS_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_TEAM_ID?: string;
  APPLE_KEY_ID?: string;
  APPLE_PRIVATE_KEY_BASE64?: string;
  APPLE_APP_BUNDLE_IDENTIFIER?: string;
  WIKISYNC_BASE_URL: string;
  TEMPLEOSRS_BASE_URL: string;
  OSRS_WIKI_PRICES_BASE_URL: string;
}

class EnvironmentVariables implements AppConfig {
  @IsIn(["development", "test", "production"])
  NODE_ENV: NodeEnv = "development";

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT = 3000;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  LOG_LEVEL = "debug";

  @IsString()
  REDIS_URL!: string;

  @IsString()
  BETTER_AUTH_SECRET = "local-dev-better-auth-secret-change-me";

  @IsString()
  BETTER_AUTH_URL = "http://localhost:3000";

  @IsString()
  BETTER_AUTH_TRUSTED_ORIGINS =
    "https://osrs-log.rossboss.dev,adventurerslog://auth,http://localhost:3000,http://localhost:3001";

  @IsString()
  AUTH_EMAIL_FROM = "Adventurers' Log <auth@rossboss.dev>";

  @IsOptional()
  @IsString()
  RESEND_API_KEY?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  GOOGLE_IOS_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_SECRET?: string;

  @IsOptional()
  @IsString()
  APPLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  APPLE_TEAM_ID?: string;

  @IsOptional()
  @IsString()
  APPLE_KEY_ID?: string;

  @IsOptional()
  @IsString()
  APPLE_PRIVATE_KEY_BASE64?: string;

  @IsOptional()
  @IsString()
  APPLE_APP_BUNDLE_IDENTIFIER?: string;

  @IsString()
  WIKISYNC_BASE_URL = "https://api.wikisync.net";

  @IsString()
  TEMPLEOSRS_BASE_URL = "https://templeosrs.com";

  @IsString()
  OSRS_WIKI_PRICES_BASE_URL = "https://prices.runescape.wiki";
}

export function validate(config: Record<string, unknown>): AppConfig {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  if (
    validatedConfig.NODE_ENV === "production" &&
    validatedConfig.BETTER_AUTH_SECRET ===
      "local-dev-better-auth-secret-change-me"
  ) {
    throw new Error("BETTER_AUTH_SECRET must be set in production.");
  }

  return validatedConfig;
}
