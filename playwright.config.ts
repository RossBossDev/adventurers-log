import { defineConfig, devices } from "@playwright/test";

const apiPort = process.env.E2E_API_PORT ?? "3100";
const webPort = process.env.E2E_WEB_PORT ?? "3101";
const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
const webBaseUrl = `http://127.0.0.1:${webPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: webBaseUrl,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: `PORT=${apiPort} pnpm --filter backend start`,
      url: `${apiBaseUrl}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `NEXT_PUBLIC_API_BASE_URL=${apiBaseUrl} pnpm --filter web dev --hostname 127.0.0.1 --port ${webPort}`,
      url: webBaseUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
