# AGENTS.md

Hexlet "AI for Developers" training project. The app is a calendar booking system defined in `requirements.md` (Russian); README just embeds it.

## Commands

- Compile TypeSpec: `npm run compile` (`npx tsp compile .`) — emits OpenAPI 3.1 to `tsp-output/schema/openapi.yaml` (configured in `tspconfig.yaml`; output is gitignored).
- Backend: `npm run backend:install && npm run backend` (or `cd backend && npm install && npm start`) — Express server with an in-memory store, implementing the calendar API contract, on `http://localhost:4010`. Data resets on restart. This is what the frontend talks to by default now.
- Frontend: `cd ui && npm install && npm run dev` — Vite dev server on `http://localhost:3000`. Talks to the backend via `VITE_API_BASE_URL` (see `ui/.env.example`, defaults to `http://localhost:4010`).

## Architecture state

- `main.tsp` implements the calendar API from `requirements.md`: `Owner`, `Event` (event type, incl. `duration` in minutes), `Slot` models, plus `Owners`/`Events`/`Slots` interfaces. Booking is not a separate entity — a guest books by calling `POST /slots/{id}/book`, which flips `Slot.is_available` to `false`.
- Package manager is pinned to npm@12 (corepack). Root deps are TypeSpec v1.14.0 (`@typespec/http`, `@typespec/openapi`, `@typespec/openapi3`, `@typespec/rest`).
- `backend/` is a separate Node/Express package (own `package.json`) implementing the API contract with an in-memory store (`backend/src/store.js`), seeded on startup with one owner, three event types, and a 14-day slot grid. Business rules enforced server-side: booking window (14 days), no double-booking of the same time across event types (`bookSlot` checks for overlapping booked slots for the same owner), standard CRUD validation. Errors are returned as `{ code, message }` per the `Error` model in `main.tsp`.
- `ui/` is a separate frontend package (own `package.json`/`vite.config.js`), plain Vite + Vanilla JS (no framework), using `@shoelace-style/shoelace` web components for UI (Mantine was dropped — it's React-only and incompatible with the "no framework" requirement; see git history/PR discussion). It talks to the backend exclusively through the HTTP contract in `openapi.yaml`/`main.tsp`.
  - `ui/src/api/client.js` — thin fetch wrapper over the contract.
  - `ui/src/router.js` — minimal path-based router; guest routes at `/` and `/events/:id`, owner routes under `/admin/*`.
  - `ui/scripts/copy-shoelace-assets.mjs` (postinstall) copies Shoelace's icon assets into `ui/public/shoelace` so they're served at a stable URL.

## Constraints (from requirements.md)

- No auth/registration: one implicit calendar owner for the admin side; guests book slots anonymously.
- A slot may not be double-booked, even across different event types — the API must enforce this.
- Booking window is 14 days from today.

## Testing instructions

- Find the CI plan in the .github/workflows folder.
- From the package root you can just call `npm run test:e2e`. The commit should pass all tests before you merge.
- Fix any test or type errors until the whole suite is green.
- Add or update tests for the code you change, even if nobody asked.

## CI

`.github/workflows/hexlet-check.yml` runs the Hexlet autograder on every push. Do not edit or delete it or rename the repo.
