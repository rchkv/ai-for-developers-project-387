import "@typespec/http";

using Http;

/**
 * Сервис бронирования календаря.
 *
 * Бизнес-правила:
 * - Регистрации/авторизации нет: владелец календаря один заранее заданный профиль,
 *   гости бронируют слоты анонимно.
 * - Доступные слоты формируются на 14 дней вперёд от текущей даты — это окно записи по умолчанию.
 * - На одно и то же время нельзя создать две записи, даже если это разные типы событий.
 */
@service(#{ title: "Calendar Booking Service" })
namespace CalendarService;

@error
model Error {
  code: int32;
  message: string;
}

model Owner {
  id: string;
  name: string;
}

model OwnerList {
  items: Owner[];
}

/** Тип (категория) события */
enum EventType {
  default,
  meeting,
  consultation,
  offline_consultation,
}

/** Тип события, который создаёт владелец календаря */
model Event {
  id: string;
  type: EventType;
  description: string;
  /** Длительность события в минутах */
  duration: int32;
}

model EventList {
  items: Event[];
}

/** Слот времени, привязанный к владельцу и типу события */
model Slot {
  id: string;
  owner_id: string;
  event_id: string;
  from: utcDateTime;
  till: utcDateTime;
  is_available: boolean;
}

model SlotList {
  items: Slot[];
}

@route("/owners")
@tag("Owners")
interface Owners {
  /** List owners */
  @get list(): OwnerList | Error;
  /** Read an owner */
  @get read(@path id: string): Owner | Error;
  /** Create an owner */
  @post create(@body body: Owner): Owner | Error;
  /** Update an owner */
  @patch update(@path id: string, @body body: MergePatchUpdate<Owner>): Owner | Error;
  /** Delete an owner */
  @delete delete(@path id: string): void | Error;
}

@route("/events")
@tag("Events")
interface Events {
  /** List event types (доступно гостям: название, описание, длительность) */
  @get list(): EventList | Error;
  /** Read an event type */
  @get read(@path id: string): Event | Error;
  /** Create an event type (владелец календаря) */
  @post create(@body body: Event): Event | Error;
  /** Update an event type */
  @patch update(@path id: string, @body body: MergePatchUpdate<Event>): Event | Error;
  /** Delete an event type */
  @delete delete(@path id: string): void | Error;
}

@route("/slots")
@tag("Slots")
interface Slots {
  /**
   * List slots.
   * Гость может отфильтровать доступные слоты по типу события (event_id) и
   * доступности (available); слоты вне окна 14 дней от текущей даты в выдачу не входят.
   */
  @get list(@query event_id?: string, @query available?: boolean): SlotList | Error;
  /** Read a slot */
  @get read(@path id: string): Slot | Error;
  /** Create a slot (владелец календаря формирует сетку слотов) */
  @post create(@body body: Slot): Slot | Error;
  /** Delete a slot */
  @delete delete(@path id: string): void | Error;

  /**
   * Забронировать слот.
   * Переводит is_available в false. Если слот уже занят (в том числе под другой
   * тип события на то же время), операция должна вернуть ошибку — двойное
   * бронирование одного времени запрещено.
   */
  @route("{id}/book") @post book(@path id: string): Slot | Error;
}
