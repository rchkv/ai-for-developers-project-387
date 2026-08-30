import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ownersRouter from "./routes/owners.js";
import eventsRouter from "./routes/events.js";
import slotsRouter from "./routes/slots.js";
import { errorHandler } from "./lib/errors.js";

const PORT = process.env.PORT || 4010;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// В production-образе сюда копируется сборка ui (`ui/dist` -> `backend/public`),
// чтобы backend мог раздавать и API, и статический UI на одном порту.
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const hasStaticUi = fs.existsSync(path.join(PUBLIC_DIR, "index.html"));

const app = express();
app.use(cors());
app.use(express.json());

if (hasStaticUi) {
  app.use(express.static(PUBLIC_DIR));

  // Клиентский роутер UI (ui/src/router.js) использует пути вида /events/:id
  // и /admin/*, которые по написанию совпадают с некоторыми путями API
  // (например, GET /events/:id). Раз и UI, и API раздаются с одного origin,
  // различаем их по заголовку Accept: обычная навигация браузера явно
  // предпочитает text/html (см. Accept-заголовок по умолчанию у браузеров),
  // а fetch-клиент UI (ui/src/api/client.js) явно просит application/json.
  // Порядок ["json", "html"] важен: при неоднозначном Accept (например, "*/*"
  // у curl или API-клиентов без явного заголовка) побеждает json, чтобы API
  // оставался доступен по контракту без нестандартных заголовков; html
  // побеждает только когда браузер явно указывает на него с приоритетом.
  app.get("*", (req, res, next) => {
    if (req.accepts(["json", "html"]) === "html") {
      res.sendFile(path.join(PUBLIC_DIR, "index.html"));
      return;
    }
    next();
  });
}

app.use("/owners", ownersRouter);
app.use("/events", eventsRouter);
app.use("/slots", slotsRouter);

app.use((req, res) => {
  res.status(404).json({ code: 404, message: `Маршрут ${req.method} ${req.path} не найден.` });
});

// Express error-handler должен принимать 4 аргумента, иначе не сработает.
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Calendar booking backend слушает http://localhost:${PORT}`);
});
