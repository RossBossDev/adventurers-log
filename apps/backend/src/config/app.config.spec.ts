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
      BETTER_AUTH_SECRET: "local-dev-better-auth-secret-change-me",
      BETTER_AUTH_URL: "http://localhost:3000",
      BETTER_AUTH_TRUSTED_ORIGINS:
        "https://osrs-log.rossboss.dev,http://localhost:3000,http://localhost:3001",
      AUTH_EMAIL_FROM: "Adventurers' Log <auth@rossboss.dev>",
      WIKISYNC_BASE_URL: "https://api.wikisync.net",
      TEMPLEOSRS_BASE_URL: "https://templeosrs.com",
      OSRS_WIKI_PRICES_BASE_URL: "https://prices.runescape.wiki",
    });
  });

  it("requires a real Better Auth secret in production", () => {
    expect(() =>
      validate({
        NODE_ENV: "production",
        PORT: "3000",
        DATABASE_URL: "postgres://postgres:postgres@localhost:5432/app",
        LOG_LEVEL: "info",
        REDIS_URL: "redis://localhost:6379",
      }),
    ).toThrow("BETTER_AUTH_SECRET must be set in production.");
  });
});
