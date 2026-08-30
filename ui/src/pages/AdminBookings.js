import { listEvents, listSlots } from "../api/client.js";
import { EVENT_TYPE_LABELS, formatDateTime, showAlert } from "../components/alert.js";

export async function renderAdminBookings(container) {
  container.innerHTML = `
    <div class="page-title"><h1>Предстоящие встречи</h1></div>
    <div id="bookings-table">Загрузка…</div>
  `;
  const tableHost = container.querySelector("#bookings-table");

  try {
    const [eventsData, slotsData] = await Promise.all([listEvents(), listSlots()]);
    const events = eventsData.items;
    const eventById = new Map(events.map((e) => [e.id, e]));
    const bookings = slotsData.items
      .filter((slot) => !slot.is_available)
      .sort((a, b) => new Date(a.from) - new Date(b.from));

    if (bookings.length === 0) {
      tableHost.innerHTML = `<div class="empty-state">Пока нет ни одной записи.</div>`;
      return;
    }

    tableHost.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Когда</th><th>Тип встречи</th></tr></thead>
        <tbody>
          ${bookings
            .map((slot) => {
              const event = eventById.get(slot.event_id);
              return `<tr>
                <td>${formatDateTime(slot.from)} – ${formatDateTime(slot.till)}</td>
                <td>${event ? EVENT_TYPE_LABELS[event.type] || event.type : slot.event_id}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    tableHost.innerHTML = "";
    showAlert(container, { variant: "danger", message: error.message });
  }
}
