const routes = [];

export function route(pattern, render) {
  const paramNames = [];
  const normalized = pattern === "/" ? "/" : pattern.replace(/\/$/, "");
  const body =
    normalized === "/"
      ? ""
      : normalized
          .split("/")
          .map((segment) => {
            if (segment.startsWith(":")) {
              paramNames.push(segment.slice(1));
              return "([^/]+)";
            }
            return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          })
          .join("/");
  const regex = new RegExp(`^${body || "/"}$`);
  routes.push({ regex, paramNames, render });
}

export function navigate(path) {
  if (path !== window.location.pathname) {
    window.history.pushState({}, "", path);
  }
  renderCurrentRoute();
}

async function renderCurrentRoute() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const app = document.getElementById("page");

  for (const { regex, paramNames, render } of routes) {
    const match = path.match(regex);
    if (match) {
      const params = {};
      paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1]);
      });
      app.innerHTML = "";
      try {
        await render(app, params);
      } catch (error) {
        renderFatalError(app, error);
      }
      return;
    }
  }

  app.innerHTML = `<div class="empty-state"><h2>Страница не найдена</h2><a href="/">На главную</a></div>`;
}

function renderFatalError(app, error) {
  console.error(error);
  app.innerHTML = `<div class="empty-state"><h2>Что-то пошло не так</h2><p>${error.message || error}</p></div>`;
}

export function initRouter() {
  document.body.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-link]");
    if (!link) return;
    event.preventDefault();
    navigate(link.getAttribute("href"));
  });

  window.addEventListener("popstate", renderCurrentRoute);
  renderCurrentRoute();
}
