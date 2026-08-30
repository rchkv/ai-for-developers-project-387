import { Router } from "express";
import * as store from "../store.js";
import { validateOwner } from "../lib/validation.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ items: store.listOwners() });
});

router.get("/:id", (req, res) => {
  res.json(store.getOwner(req.params.id));
});

router.post("/", (req, res) => {
  validateOwner(req.body);
  res.status(201).json(store.createOwner(req.body));
});

router.patch("/:id", (req, res) => {
  validateOwner(req.body, { partial: true });
  res.json(store.updateOwner(req.params.id, req.body));
});

router.delete("/:id", (req, res) => {
  store.deleteOwner(req.params.id);
  res.status(204).end();
});

export default router;
