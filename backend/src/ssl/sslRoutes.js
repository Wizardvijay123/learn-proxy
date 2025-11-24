import express from "express";
import { toggleSSL, getSSLStatus } from "./store.js";
import logger from "../logging/logger.js";

const router = express.Router();

// toggle SSL
router.post("/toggle", (req, res) => {
  const newStatus = toggleSSL();

  logger.logSslToggle({
    action: newStatus ? "enabled" : "disabled",
    by: "user"
  });

  res.json({
    ok: true,
    ssl: newStatus
  });
});

// get status
router.get("/status", (req, res) => {
  res.json({
    ok: true,
    ssl: getSSLStatus()
  });
});

export default router;
