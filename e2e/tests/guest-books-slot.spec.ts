import { test, expect } from "@playwright/test";
import { createEventTypeViaApi, createSlotViaApi, dateDaysFromNow } from "./helpers";

test("Клиент видит доступные ивенты и может забронировать слот; слот пропадает из списка", async ({
  page,
  request,
}) => {
  const stamp = Date.now();
  const eventId = `e2e-event-${stamp}`;
  const slotId = `e2e-slot-${stamp}`;
  const description = `Слот для бронирования ${stamp}`;
  const slotFrom = dateDaysFromNow(1, 18, 30);

  await createEventTypeViaApi(request, eventId, description);
  await createSlotViaApi(request, slotId, eventId, slotFrom);

  await page.goto("/");

  const card = page.locator(".event-card", { hasText: description });
  await expect(card).toBeVisible();

  await card.getByRole("button", { name: "Выбрать время" }).click();

  const slotButton = page.locator(`.slot-button[data-slot-id="${slotId}"]`);
  await expect(slotButton).toBeVisible();

  await slotButton.click();
  await expect(page.locator("#confirm-dialog")).toBeVisible();
  await page.locator("#confirm-ok").click();

  await expect(slotButton).toHaveCount(0);
});