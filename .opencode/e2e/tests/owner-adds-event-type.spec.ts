import { test, expect } from "@playwright/test";

const DESCRIPTION = `Тестовый тип встречи ${Date.now()}`;

test("Владелец может добавить новый тип ивента", async ({ page }) => {
  await page.goto("/admin/events");

  await page.locator("#create-event-btn").click();

  const dialog = page.locator("#event-dialog");
  await expect(dialog.locator("sl-textarea[name='description']").locator("textarea")).toBeVisible();

  await page.locator('sl-textarea[name="description"]').locator("textarea").fill(DESCRIPTION);
  await page.locator('sl-input[name="duration"]').locator("input").fill("45");

  await page.locator("#event-form sl-button[type='submit']").click();

  await expect(dialog).not.toBeVisible();
  await expect(page.locator("#events-table")).toContainText(DESCRIPTION);
  await expect(page.locator("#events-table")).toContainText("45 мин");
});