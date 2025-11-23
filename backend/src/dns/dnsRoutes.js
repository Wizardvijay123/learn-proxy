// backend/src/dns/dnsRoutes.js
import express from "express";
import { dnsRecords, addRecord, deleteRecord } from "./dnsStore.js";

const router = express.Router();

// Lookup route
router.get("/lookup", (req, res) => {
  const domain = req.query.domain;
  if (!domain) return res.status(400).json({ error: "Domain is required" });

  const record = dnsRecords[domain];
  if (!record) return res.status(404).json({ error: "not found" });

  res.json(record);
});

// List all DNS records
router.get("/list", (req, res) => {
  res.json(dnsRecords);
});

// Add DNS record
router.post("/add", (req, res) => {
  const { domain, ip } = req.body;
  if (!domain || !ip) return res.status(400).json({ error: "domain & ip required" });

  const record = addRecord(domain, ip);
  res.json({ success: true, record });
});

// Delete DNS record (REST-style)
router.delete("/:domain", (req, res) => {
  const { domain } = req.params;
  if (!domain) return res.status(400).json({ error: "domain required" });

  const result = deleteRecord(domain);
  if (!result) return res.status(404).json({ error: "not found" });

  res.json({ success: true, domain });
});

export default router;
