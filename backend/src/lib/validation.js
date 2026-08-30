import { badRequest } from "./errors.js";

const EVENT_TYPES = ["default", "meeting", "consultation", "offline_consultation"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateOwner(body, { partial = false } = {}) {
  if (!body || typeof body !== "object") throw badRequest("Тело запроса должно быть объектом.");
  if (!partial || body.id !== undefined) {
    if (!isNonEmptyString(body.id)) throw badRequest("Поле 'id' обязательно и должно быть непустой строкой.");
  }
  if (!partial || body.name !== undefined) {
    if (!isNonEmptyString(body.name)) throw badRequest("Поле 'name' обязательно и должно быть непустой строкой.");
  }
}

export function validateEvent(body, { partial = false } = {}) {
  if (!body || typeof body !== "object") throw badRequest("Тело запроса должно быть объектом.");
  if (!partial || body.id !== undefined) {
    if (!isNonEmptyString(body.id)) throw badRequest("Поле 'id' обязательно и должно быть непустой строкой.");
  }
  if (!partial || body.type !== undefined) {
    if (!EVENT_TYPES.includes(body.type)) {
      throw badRequest(`Поле 'type' должно быть одним из: ${EVENT_TYPES.join(", ")}.`);
    }
  }
  if (!partial || body.description !== undefined) {
    if (!isNonEmptyString(body.description)) throw badRequest("Поле 'description' обязательно и должно быть непустой строкой.");
  }
  if (!partial || body.duration !== undefined) {
    if (!Number.isInteger(body.duration) || body.duration <= 0) {
      throw badRequest("Поле 'duration' должно быть положительным целым числом (минуты).");
    }
  }
}

export function validateSlot(body) {
  if (!body || typeof body !== "object") throw badRequest("Тело запроса должно быть объектом.");
  if (!isNonEmptyString(body.id)) throw badRequest("Поле 'id' обязательно и должно быть непустой строкой.");
  if (!isNonEmptyString(body.owner_id)) throw badRequest("Поле 'owner_id' обязательно и должно быть непустой строкой.");
  if (!isNonEmptyString(body.event_id)) throw badRequest("Поле 'event_id' обязательно и должно быть непустой строкой.");
  if (!isNonEmptyString(body.from) || Number.isNaN(Date.parse(body.from))) {
    throw badRequest("Поле 'from' должно быть корректной датой в формате ISO 8601.");
  }
  if (!isNonEmptyString(body.till) || Number.isNaN(Date.parse(body.till))) {
    throw badRequest("Поле 'till' должно быть корректной датой в формате ISO 8601.");
  }
  if (Date.parse(body.till) <= Date.parse(body.from)) {
    throw badRequest("Поле 'till' должно быть позже 'from'.");
  }
  if (body.is_available !== undefined && typeof body.is_available !== "boolean") {
    throw badRequest("Поле 'is_available' должно быть булевым значением.");
  }
}
