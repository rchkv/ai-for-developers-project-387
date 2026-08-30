import { listEvents, listSlots, bookSlot, ApiError } from "../api/client.js";
import { EVENT_TYPE_LABELS, formatDay, formatTime, showAlert } from "../components/alert.js";

export async function renderGuestEventSlots(container, { id }) {
  container.innerHTML = `
    <a class="back-link" href="/" data-link><sl-icon name="arrow-left"></sl-icon> К списку встреч</a>
    <div id="slots-content">Загрузка…</div>
  `;
  const content = container.querySelector("#slots-content");

  let event;
  let slots;
  try {
    const eventsData = await listEvents();
    event = eventsData.items.find((e) => e.id === id);
    if (!event) throw new Error("Тип встречи не найден.");
    const data = await listSlots({ eventId: id, available: true });
    slots = data.items.filter((slot) => slot.event_id === id && slot.is_available);
  } catch (error) {
    content.innerHTML = "";
    showAlert(container, { variant: "danger", message: error.message });
    return;
  }

  const title = `
    <div class="page-title">
      <div>
        <h1>${EVENT_TYPE_LABELS[event.type] || event.type}</h1>
        <p>${event.description} · ${event.duration} мин</p>
      </div>
    </div>`;

  if (slots.length === 0) {
    content.innerHTML = `${title}<div class="empty-state">Нет свободных слотов на ближайшие 14 дней.</div>`;
    return;
  }

  const byDay = new Map();
  for (const slot of slots.sort((a, b) => new Date(a.from) - new Date(b.from))) {
    const dayKey = formatDay(slot.from);
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey).push(slot);
  }

  content.innerHTML = `
    ${title}
    ${Array.from(byDay.entries())
      .map(
        ([day, daySlots]) => `
        <div class="slot-day">
          <div class="slot-day__title">${day}</div>
          <div class="slot-grid">
            ${daySlots
              .map(
                (slot) =>
                  `<sl-button size="medium" class="slot-button" data-slot-id="${slot.id}">${formatTime(slot.from)}</sl-button>`,
              )
              .join("")}
          </div>
        </div>`,
      )
      .join("")}
    <sl-dialog id="confirm-dialog" label="Подтверждение бронирования">
      <p id="confirm-dialog-text"></p>
      <sl-button slot="footer" variant="default" id="confirm-cancel">Отмена</sl-button>
      <sl-button slot="footer" variant="primary" id="confirm-ok">Забронировать</sl-button>
    </sl-dialog>
  `;

  const dialog = content.querySelector("#confirm-dialog");
  const dialogText = content.querySelector("#confirm-dialog-text");
  const confirmOk = content.querySelector("#confirm-ok");
  const confirmCancel = content.querySelector("#confirm-cancel");
  let selectedSlot = null;

  content.querySelectorAll(".slot-button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSlot = slots.find((s) => s.id === button.dataset.slotId);
      dialogText.textContent = `${formatDay(selectedSlot.from)}, ${formatTime(selectedSlot.from)}–${formatTime(selectedSlot.till)}`;
      dialog.show();
    });
  });

  confirmCancel.addEventListener("click", () => dialog.hide());

  confirmOk.addEventListener("click", async () => {
    if (!selectedSlot) return;
    confirmOk.loading = true;
    try {
      await bookSlot(selectedSlot.id);
      dialog.hide();
      showAlert(container, { variant: "success", message: "Слот успешно забронирован." });
      await renderGuestEventSlots(container, { id });
    } catch (error) {
      confirmOk.loading = false;
      dialog.hide();
      const message = error instanceof ApiError ? error.message : "Не удалось забронировать слот.";
      showAlert(container, { variant: "danger", message });
    }
  });
}
