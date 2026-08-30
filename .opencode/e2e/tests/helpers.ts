import { Page, APIRequestContext } from "@playwright/test";

export const BACKEND_URL = "http://localhost:4010";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function dateDaysFromNow(days: number, hour = 19, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

/**
 * Shoelace sl-select - a web component. Set its value directly via the
 * component API (more reliable than driving the shadow-DOM popup).
 */
export async function selectShoelaceValue(page: Page, locator: string, value: string): Promise<void> {
  await page.locator(locator).evaluate((el: HTMLElement, v: string) => {
    const select = el as HTMLSelectElement & { value: string };
    select.value = v;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

export async function createEventTypeViaApi(request: APIRequestContext, eventId: string, description: string) {
  const response = await request.post(`${BACKEND_URL}/events`, {
    data: { id: eventId, type: "meeting", description, duration: 30 },
  });
  if (!response.ok()) {
    throw new Error(`Failed to create event via API: ${response.status()} ${await response.text()}`);
  }
}

export async function createSlotViaApi(request: APIRequestContext, slotId: string, eventId: string, from: Date) {
  const till = new Date(from.getTime() + 30 * 60 * 1000);
  const response = await request.post(`${BACKEND_URL}/slots`, {
    data: {
      id: slotId,
      owner_id: "owner-1",
      event_id: eventId,
      from: from.toISOString(),
      till: till.toISOString(),
      is_available: true,
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to create slot via API: ${response.status()} ${await response.text()}`);
  }
}