import { expect, test } from "@playwright/test";

test("web app renders and can query backend health", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Adventurers' Log" }),
  ).toBeVisible();
  await expect(page.getByTestId("api-health")).toContainText("healthy", {
    timeout: 15_000,
  });
});
