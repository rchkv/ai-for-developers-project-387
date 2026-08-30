import { listEvents } from "../api/client.js";
import { EVENT_TYPE_LABELS, showAlert } from "../components/alert.js";

export async function renderGuestEvents(container) {
  container.innerHTML = `<div class="page-title"><h1>Выберите тип встречи</h1></div><div id="events-content">Загрузка…</div>`;
  const content = container.querySelector("#events-content");

  let events;
  try {
    const data = await listEvents();
    events = data.items;
  } catch (error) {
    content.innerHTML = "";
    showAlert(container, { variant: "danger", message: error.message });
    return;
  }

  if (events.length === 0) {
    content.innerHTML = `<div class="empty-state">Пока нет доступных типов встреч.</div>`;
    return;
  }

  content.innerHTML = `<div class="card-grid">${events
    .map(
      (event) => `
      <sl-card class="event-card">
        <strong>${EVENT_TYPE_LABELS[event.type] || event.type}</strong>
        <p>${event.description}</p>
        <p><sl-icon name="clock"></sl-icon> ${event.duration} мин</p>
        <a href="/events/${event.id}" data-link>
          <sl-button variant="primary">Выбрать время</sl-button>
        </a>
      </sl-card>`,
    )
    .join("")}</div>`;
}
