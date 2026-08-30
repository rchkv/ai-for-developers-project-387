import { listEvents, listSlots, createSlot, deleteSlot } from "../api/client.js";
import { EVENT_TYPE_LABELS, formatDateTime, showAlert } from "../components/alert.js";

export async function renderAdminSlots(container) {
  container.innerHTML = `
    <div class="page-title"><h1>Слоты</h1></div>
    ${renderForm()}
    <h2>Существующие слоты</h2>
    <div id="slots-table">Загрузка…</div>
  `;

  const form = container.querySelector("#slot-form");
  const eventSelect = form.querySelector("[name=event_id]");
  const tableHost = container.querySelector("#slots-table");

  let events = [];

  async function loadEvents() {
    const data = await listEvents();
    events = data.items;
    eventSelect.innerHTML = events
      .map((event) => `<sl-option value="${event.id}">${EVENT_TYPE_LABELS[event.type] || event.type} (${event.duration} мин)</sl-option>`)
      .join("");
  }

  async function reloadSlots() {
    try {
      const data = await listSlots();
      const slots = data.items.sort((a, b) => new Date(a.from) - new Date(b.from));
      tableHost.innerHTML = renderTable(slots, events);
      tableHost.querySelectorAll("[data-delete]").forEach((btn) =>
        btn.addEventListener("click", () => onDelete(btn.dataset.delete)),
      );
    } catch (error) {
      tableHost.innerHTML = "";
      showAlert(container, { variant: "danger", message: error.message });
    }
  }

  async function onDelete(id) {
    try {
      await deleteSlot(id);
      await reloadSlots();
    } catch (error) {
      showAlert(container, { variant: "danger", message: error.message });
    }
  }

  form.addEventListener("submit", async (submitEvent) => {
    submitEvent.preventDefault();
    const event = events.find((e) => e.id === eventSelect.value);
    if (!event) {
      showAlert(container, { variant: "danger", message: "Выберите тип встречи." });
      return;
    }
    const dateValue = form.querySelector('[name="date"]').value;
    const timeValue = form.querySelector('[name="time"]').value;
    if (!dateValue || !timeValue) {
      showAlert(container, { variant: "danger", message: "Укажите дату и время." });
      return;
    }
    const from = new Date(`${dateValue}T${timeValue}`);
    const till = new Date(from.getTime() + event.duration * 60 * 1000);
    const payload = {
      id: `slot-${Date.now()}`,
      owner_id: "owner-1",
      event_id: event.id,
      from: from.toISOString(),
      till: till.toISOString(),
      is_available: true,
    };

    try {
      await createSlot(payload);
      form.reset();
      showAlert(container, { variant: "success", message: "Слот создан." });
      await reloadSlots();
    } catch (error) {
      showAlert(container, { variant: "danger", message: error.message });
    }
  });

  await loadEvents();
  await reloadSlots();
}

function renderForm() {
  return `
    <form id="slot-form" class="form-grid">
      <sl-select name="event_id" label="Тип встречи" required></sl-select>
      <sl-input name="date" label="Дата" type="date" required></sl-input>
      <sl-input name="time" label="Время" type="time" required></sl-input>
      <sl-button type="submit" variant="primary">Создать слот</sl-button>
    </form>
  `;
}

function renderTable(slots, events) {
  if (slots.length === 0) {
    return `<div class="empty-state">Слотов пока нет.</div>`;
  }
  const eventById = new Map(events.map((e) => [e.id, e]));
  return `
    <table class="admin-table">
      <thead><tr><th>Когда</th><th>Тип встречи</th><th>Статус</th><th></th></tr></thead>
      <tbody>
        ${slots
          .map((slot) => {
            const event = eventById.get(slot.event_id);
            return `
          <tr>
            <td>${formatDateTime(slot.from)} – ${formatDateTime(slot.till)}</td>
            <td>${event ? EVENT_TYPE_LABELS[event.type] || event.type : slot.event_id}</td>
            <td>${slot.is_available ? "Свободен" : "Забронирован"}</td>
            <td class="table-actions">
              <sl-button size="small" variant="danger" data-delete="${slot.id}">Удалить</sl-button>
            </td>
          </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;
}
