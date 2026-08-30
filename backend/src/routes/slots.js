import { Router } from "express";
import * as store from "../store.js";
import { validateSlot } from "../lib/validation.js";
import { badRequest } from "../lib/errors.js";

const router = Router();

function parseAvailable(value) {
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  throw badRequest("Параметр 'available' должен быть 'true' или 'false'.");
}

router.get("/", (req, res) => {
  const eventId = req.query.event_id;
  const available = parseAvailable(req.query.available);
  res.json({ items: store.listSlots({ eventId, available }) });
});

router.get("/:id", (req, res) => {
  res.json(store.getSlot(req.params.id));
});

router.post("/", (req, res) => {
  validateSlot(req.body);
  res.status(201).json(store.createSlot(req.body));
});

router.delete("/:id", (req, res) => {
  store.deleteSlot(req.params.id);
  res.status(204).end();
});

router.post("/:id/book", (req, res) => {
  res.json(store.bookSlot(req.params.id));
});

export default router;
