// backend/src/firewall/firewallRoutes.js
import express from "express";
import {
  listRules,
  addRule,
  removeRule,
  updateRule,
} from "./store.js";

const router = express.Router();

// Get all rules
router.get("/rules", (req, res) => {
  res.json({ ok: true, rules: listRules() });
});

// Add new rule
router.post("/rules", (req, res) => {
  const { type, value, comment } = req.body;
  if (!type || !value) {
    return res.status(400).json({ ok: false, msg: "type & value required" });
  }
  const rule = addRule({ type, value, comment });
  res.json({ ok: true, rule });
});

// Delete a rule
router.delete("/rules/:id", (req, res) => {
  const ok = removeRule(req.params.id);
  res.json({ ok });
});

// Update rule (enable/disable)
router.patch("/rules/:id", (req, res) => {
  const updated = updateRule(req.params.id, req.body);
  if (!updated) return res.status(404).json({ ok: false });
  res.json({ ok: true, rule: updated });
});

export default router;
