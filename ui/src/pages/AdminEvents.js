import { listEvents, createEvent, updateEvent, deleteEvent } from "../api/client.js";
import { EVENT_TYPE_LABELS, showAlert } from "../components/alert.js";

const EVENT_TYPES = Object.keys(EVENT_TYPE_LABELS);

export async function renderAdminEvents(container) {
  container.innerHTML = `
    <div class="page-title">
      <h1>Типы встреч</h1>
      <sl-button variant="primary" id="create-event-btn"><sl-icon slot="prefix" name="plus-lg"></sl-icon>Добавить тип</sl-button>
    </div>
    <div id="events-table">Загрузка…</div>
    ${renderEventDialog()}
  `;

  const tableHost = container.querySelector("#events-table");
  const dialog = container.querySelector("#event-dialog");
  const form = container.querySelector("#event-form");

  async function reload() {
    try {
      const data = await listEvents();
      const events = data.items;
      tableHost.innerHTML = renderTable(events);
      tableHost.querySelectorAll("[data-edit]").forEach((btn) =>
        btn.addEventListener("click", () => openDialog(events.find((e) => e.id === btn.dataset.edit))),
      );
      tableHost.querySelectorAll("[data-delete]").forEach((btn) =>
        btn.addEventListener("click", () => onDelete(btn.dataset.delete)),
      );
    } catch (error) {
      tableHost.innerHTML = "";
      showAlert(container, { variant: "danger", message: error.message });
    }
  }

  function field(name) {
    return form.querySelector(`[name="${name}"]`);
  }

  function openDialog(event) {
    form.reset();
    field("id").value = event?.id || "";
    field("id").disabled = Boolean(event);
    field("type").value = event?.type || EVENT_TYPES[0];
    field("description").value = event?.description || "";
    field("duration").value = event?.duration ?? 30;
    dialog.label = event ? "Редактировать тип встречи" : "Новый тип встречи";
    dialog.show();
  }

  async function onDelete(id) {
    try {
      await deleteEvent(id);
      await reload();
    } catch (error) {
      showAlert(container, { variant: "danger", message: error.message });
    }
  }

  container.querySelector("#create-event-btn").addEventListener("click", () => openDialog(null));
  container.querySelector("#event-cancel").addEventListener("click", () => dialog.hide());

  form.addEventListener("submit", async (submitEvent) => {
    submitEvent.preventDefault();
    const isEdit = field("id").disabled;
    const payload = {
      id: field("id").value || `event-${Date.now()}`,
      type: field("type").value,
      description: field("description").value,
      duration: Number(field("duration").value),
    };

    try {
      if (isEdit) {
        await updateEvent(payload.id, payload);
      } else {
        await createEvent(payload);
      }
      dialog.hide();
      showAlert(container, { variant: "success", message: "Сохранено." });
      await reload();
    } catch (error) {
      showAlert(container, { variant: "danger", message: error.message });
    }
  });

  await reload();
}

function renderTable(events) {
  if (events.length === 0) {
    return `<div class="empty-state">Типов встреч пока нет.</div>`;
  }
  return `
    <table class="admin-table">
      <thead><tr><th>Название</th><th>Описание</th><th>Длительность</th><th></th></tr></thead>
      <tbody>
        ${events
          .map(
            (event) => `
          <tr>
            <td>${EVENT_TYPE_LABELS[event.type] || event.type}</td>
            <td>${event.description}</td>
            <td>${event.duration} мин</td>
            <td class="table-actions">
              <sl-button size="small" data-edit="${event.id}">Изменить</sl-button>
              <sl-button size="small" variant="danger" data-delete="${event.id}">Удалить</sl-button>
            </td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderEventDialog() {
  return `
    <sl-dialog id="event-dialog" label="Тип встречи">
      <form id="event-form" class="form-grid">
        <input type="hidden" name="id" />
        <sl-select name="type" label="Тип">
          ${EVENT_TYPES.map((type) => `<sl-option value="${type}">${EVENT_TYPE_LABELS[type]}</sl-option>`).join("")}
        </sl-select>
        <sl-textarea name="description" label="Описание" required></sl-textarea>
        <sl-input name="duration" label="Длительность (мин)" type="number" min="5" step="5" required></sl-input>
        <div style="display:flex; gap:.5rem; justify-content:flex-end;">
          <sl-button type="button" id="event-cancel">Отмена</sl-button>
          <sl-button type="submit" variant="primary">Сохранить</sl-button>
        </div>
      </form>
    </sl-dialog>
  `;
}
