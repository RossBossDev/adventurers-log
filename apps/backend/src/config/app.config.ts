import { plainToInstance, Type } from "class-transformer";
import {
  IsIn,
  IsNumber,
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

  return validatedConfig;
}
