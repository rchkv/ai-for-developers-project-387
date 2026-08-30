import { test, expect } from "@playwright/test";
import { dateDaysFromNow, formatDateInput, selectShoelaceValue } from "./helpers";

test("Владелец может добавить новый доступный ивент (слот)", async ({ page }) => {
  const slotFrom = dateDaysFromNow(1, 19, 0);

  await page.goto("/admin/slots");

  await expect(page.locator("#slot-form")).toBeVisible();

  await selectShoelaceValue(page, '#slot-form sl-select[name="event_id"]', "event-meeting");
  await page.locator('sl-input[name="date"]').locator("input").fill(formatDateInput(slotFrom));
  await page.locator('sl-input[name="time"]').locator("input").fill("19:00");

  await page.locator("#slot-form sl-button[type='submit']").click();

  await expect(page.getByText("Слот создан.")).toBeVisible();
  await expect(page.locator("#slots-table")).toContainText("19:00");
  await expect(page.locator("#slots-table")).toContainText("Рабочая встреча");
});