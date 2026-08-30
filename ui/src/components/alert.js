export function showAlert(container, { variant = "primary", message }) {
  const alert = document.createElement("sl-alert");
  alert.variant = variant;
  alert.closable = true;
  alert.open = true;
  alert.innerHTML = `
    <sl-icon slot="icon" name="${variant === "danger" ? "exclamation-octagon" : "info-circle"}"></sl-icon>
    ${message}
  `;
  container.prepend(alert);
  return alert;
}

export const EVENT_TYPE_LABELS = {
  default: "Обычная встреча",
  meeting: "Рабочая встреча",
  consultation: "Консультация",
  offline_consultation: "Offline консультация",
};

export function formatDateTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString("ru-RU", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function formatDay(iso) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}
