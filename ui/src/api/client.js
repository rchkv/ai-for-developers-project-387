// Если VITE_API_BASE_URL не задан при сборке, выбираем адрес бэкенда:
// - в dev-режиме UI и API живут на разных портах (3000 и 4010), поэтому
//   обращаемся к бэкенду напрямую;
// - в production-образе (Docker) backend раздаёт собранный UI и API с одного
//   порта, поэтому используем текущий origin страницы.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:4010" : window.location.origin);

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

async function request(path, { method = "GET", body, query } = {}) {
  const url = new URL(path, BASE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  // Явный Accept: application/json нужен, чтобы backend мог отличить
  // fetch-запросы UI от навигации браузера, когда UI и API раздаются с
  // одного origin (см. backend/src/server.js) — иначе, например,
  // GET /events/:id было бы неоднозначно между API и SPA-страницей.
  const headers = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Не удалось соединиться с сервером. Проверьте, что бэкенд запущен.");
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || `Ошибка запроса (${response.status})`;
    throw new ApiError(data?.code ?? response.status, message);
  }

  return data;
}

// Owners
export const listOwners = () => request("/owners");

// Events
export const listEvents = () => request("/events");
export const getEvent = (id) => request(`/events/${id}`);
export const createEvent = (event) => request("/events", { method: "POST", body: event });
export const updateEvent = (id, patch) => request(`/events/${id}`, { method: "PATCH", body: patch });
export const deleteEvent = (id) => request(`/events/${id}`, { method: "DELETE" });

// Slots
export const listSlots = ({ eventId, available } = {}) =>
  request("/slots", { query: { event_id: eventId, available } });
export const getSlot = (id) => request(`/slots/${id}`);
export const createSlot = (slot) => request("/slots", { method: "POST", body: slot });
export const deleteSlot = (id) => request(`/slots/${id}`, { method: "DELETE" });
export const bookSlot = (id) => request(`/slots/${id}/book`, { method: "POST" });
