/**
 * In-memory хранилище данных сервиса бронирования.
 *
 * Данные существуют только в памяти процесса и сбрасываются при перезапуске.
 * При старте наполняется тестовыми данными: один владелец, три типа событий
 * и сетка слотов на BOOKING_WINDOW_DAYS дней вперёд.
 */
import { notFound, conflict } from "./lib/errors.js";

export const BOOKING_WINDOW_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

const owners = new Map();
const events = new Map();
const slots = new Map();

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function seed() {
  const owner = { id: "owner-1", name: "Иван Петров" };
  owners.set(owner.id, owner);

  const eventList = [
    { id: "event-default", type: "default", description: "Быстрая встреча без уточнения формата", duration: 30 },
    { id: "event-meeting", type: "meeting", description: "Рабочая встреча по проекту", duration: 60 },
    { id: "event-consultation", type: "consultation", description: "Персональная консультация", duration: 45 },
  ];
  for (const event of eventList) events.set(event.id, event);

  const dailyHours = [10, 11, 12, 14, 15, 16, 17];
  const today = startOfDay(new Date());

  for (let day = 0; day < BOOKING_WINDOW_DAYS; day += 1) {
    for (let i = 0; i < dailyHours.length; i += 1) {
      const event = eventList[(day + i) % eventList.length];
      const from = new Date(today.getTime() + day * DAY_MS);
      from.setHours(dailyHours[i], 0, 0, 0);
      const till = new Date(from.getTime() + event.duration * 60 * 1000);
      // Деterministически бронируем ~1 из 5 слотов, чтобы было что показать в демо.
      const isAvailable = (day * dailyHours.length + i) % 5 !== 0;
      const slot = {
        id: `slot-${day}-${dailyHours[i]}`,
        owner_id: owner.id,
        event_id: event.id,
        from: from.toISOString(),
        till: till.toISOString(),
        is_available: isAvailable,
      };
      slots.set(slot.id, slot);
    }
  }
}

seed();

function intervalsOverlap(aFrom, aTill, bFrom, bTill) {
  return aFrom < bTill && bFrom < aTill;
}

function isWithinBookingWindow(slot, now = new Date()) {
  const from = new Date(slot.from).getTime();
  const windowEnd = now.getTime() + BOOKING_WINDOW_DAYS * DAY_MS;
  return from >= now.getTime() && from < windowEnd;
}

// --- Owners ---

export function listOwners() {
  return Array.from(owners.values());
}

export function getOwner(id) {
  const owner = owners.get(id);
  if (!owner) throw notFound(`Владелец с id='${id}' не найден.`);
  return owner;
}

export function createOwner(body) {
  if (owners.has(body.id)) throw conflict(`Владелец с id='${body.id}' уже существует.`);
  const owner = { id: body.id, name: body.name };
  owners.set(owner.id, owner);
  return owner;
}

export function updateOwner(id, patch) {
  const owner = getOwner(id);
  const updated = { ...owner, ...patch };
  owners.set(id, updated);
  return updated;
}

export function deleteOwner(id) {
  getOwner(id);
  owners.delete(id);
}

// --- Events ---

export function listEvents() {
  return Array.from(events.values());
}

export function getEvent(id) {
  const event = events.get(id);
  if (!event) throw notFound(`Тип события с id='${id}' не найден.`);
  return event;
}

export function createEvent(body) {
  if (events.has(body.id)) throw conflict(`Тип события с id='${body.id}' уже существует.`);
  const event = { id: body.id, type: body.type, description: body.description, duration: body.duration };
  events.set(event.id, event);
  return event;
}

export function updateEvent(id, patch) {
  const event = getEvent(id);
  const updated = { ...event, ...patch };
  events.set(id, updated);
  return updated;
}

export function deleteEvent(id) {
  getEvent(id);
  events.delete(id);
}

// --- Slots ---

export function listSlots({ eventId, available } = {}) {
  const now = new Date();
  let result = Array.from(slots.values()).filter((slot) => isWithinBookingWindow(slot, now));
  if (eventId !== undefined) result = result.filter((slot) => slot.event_id === eventId);
  if (available !== undefined) result = result.filter((slot) => slot.is_available === available);
  return result.sort((a, b) => new Date(a.from) - new Date(b.from));
}

export function getSlot(id) {
  const slot = slots.get(id);
  if (!slot) throw notFound(`Слот с id='${id}' не найден.`);
  return slot;
}

export function createSlot(body) {
  if (slots.has(body.id)) throw conflict(`Слот с id='${body.id}' уже существует.`);
  const slot = {
    id: body.id,
    owner_id: body.owner_id,
    event_id: body.event_id,
    from: body.from,
    till: body.till,
    is_available: body.is_available !== undefined ? body.is_available : true,
  };
  slots.set(slot.id, slot);
  return slot;
}

export function deleteSlot(id) {
  getSlot(id);
  slots.delete(id);
}

/**
 * Забронировать слот.
 *
 * Правило: на одно и то же время у владельца не может быть двух броней,
 * даже под разные типы событий. Поэтому перед бронированием проверяем не
 * только флаг is_available самого слота, но и отсутствие пересечения по
 * времени с любым другим уже занятым слотом того же владельца.
 */
export function bookSlot(id) {
  const slot = getSlot(id);

  if (!slot.is_available) {
    throw conflict(`Слот с id='${id}' уже занят.`);
  }

  const slotFrom = new Date(slot.from).getTime();
  const slotTill = new Date(slot.till).getTime();

  const hasOverlap = Array.from(slots.values()).some((other) => {
    if (other.id === slot.id) return false;
    if (other.owner_id !== slot.owner_id) return false;
    if (other.is_available) return false;
    const otherFrom = new Date(other.from).getTime();
    const otherTill = new Date(other.till).getTime();
    return intervalsOverlap(slotFrom, slotTill, otherFrom, otherTill);
  });

  if (hasOverlap) {
    throw conflict("На это время уже есть другая запись. Двойное бронирование запрещено.");
  }

  const updated = { ...slot, is_available: false };
  slots.set(id, updated);
  return updated;
}
