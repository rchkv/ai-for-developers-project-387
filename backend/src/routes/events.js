import { Router } from "express";
import * as store from "../store.js";
import { validateEvent } from "../lib/validation.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ items: store.listEvents() });
});

router.get("/:id", (req, res) => {
  res.json(store.getEvent(req.params.id));
});

router.post("/", (req, res) => {
  validateEvent(req.body);
  res.status(201).json(store.createEvent(req.body));
});

router.patch("/:id", (req, res) => {
  validateEvent(req.body, { partial: true });
  res.json(store.updateEvent(req.params.id, req.body));
});

router.delete("/:id", (req, res) => {
  store.deleteEvent(req.params.id);
  res.status(204).end();
});

export default router;
