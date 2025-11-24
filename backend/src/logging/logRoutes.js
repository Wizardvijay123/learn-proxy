// backend/src/logging/logRoutes.js
import express from "express";
import logger from "./logger.js";

const router = express.Router();

// GET /logs?limit=100
router.get("/logs", (req, res) => {
  const limit = Number(req.query.limit) || 200;
  res.json({ ok: true, logs: logger.list({ limit }) });
});

// POST /logs/clear
router.post("/logs/clear", (req, res) => {
  logger.clear();
  res.json({ ok: true });
});

export default router;
