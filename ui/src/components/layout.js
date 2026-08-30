export function renderLayout(root) {
  root.innerHTML = `
    <header class="app-header">
      <a class="app-header__brand" href="/" data-link>Календарь бронирования</a>
      <nav class="app-header__nav">
        <a href="/" data-link><sl-button size="small" variant="text">Гость</sl-button></a>
        <a href="/admin/events" data-link><sl-button size="small" variant="text">Владелец</sl-button></a>
      </nav>
    </header>
    <main id="page" class="app-main"></main>
  `;
}
