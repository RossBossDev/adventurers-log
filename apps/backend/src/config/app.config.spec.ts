import "reflect-metadata";
import { validate } from "./app.config";

describe("app config", () => {
  it("validates and coerces environment variables", () => {
    expect(
      validate({
        NODE_ENV: "development",
        PORT: "3000",
        DATABASE_URL: "postgres://postgres:postgres@localhost:5432/app",
        LOG_LEVEL: "debug",
        REDIS_URL: "redis://localhost:6379",
      }),
    ).toEqual({
      NODE_ENV: "development",
      PORT: 3000,
      DATABASE_URL: "postgres://postgres:postgres@localhost:5432/app",
      LOG_LEVEL: "debug",
      REDIS_URL: "redis://localhost:6379",
    });
  });
});
