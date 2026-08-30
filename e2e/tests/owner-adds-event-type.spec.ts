import { test, expect } from "@playwright/test";
import { selectShoelaceValue } from "./helpers";

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

test("Владелец может добавить тип ивента «Offline консультация», и он виден гостю", async ({ page }) => {
  const description = `Offline консультация в офисе ${Date.now()}`;

  await page.goto("/admin/events");

  await page.locator("#create-event-btn").click();

  const dialog = page.locator("#event-dialog");
  await expect(dialog.locator("sl-textarea[name='description']").locator("textarea")).toBeVisible();

  await selectShoelaceValue(page, "#event-form sl-select[name='type']", "offline_consultation");
  await page.locator('sl-textarea[name="description"]').locator("textarea").fill(description);
  await page.locator('sl-input[name="duration"]').locator("input").fill("60");

  await page.locator("#event-form sl-button[type='submit']").click();

  await expect(dialog).not.toBeVisible();
  await expect(page.locator("#events-table")).toContainText("Offline консультация");
  await expect(page.locator("#events-table")).toContainText(description);

  await page.goto("/");
  await expect(page.locator("#events-content")).toContainText("Offline консультация");
  await expect(page.locator("#events-content")).toContainText(description);
});
