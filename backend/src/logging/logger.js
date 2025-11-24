// backend/src/logging/logger.js
import fs from "fs";
import path from "path";

const LOG_MAX = 1000; // max items in memory
const PERSIST_FILE = path.resolve("logs/firewall_logs.json"); // optional

class Logger {
  constructor() {
    this.logs = []; // newest last
    this.subscribers = new Set(); // ws clients
  }

  _push(log) {
    // ensure timestamp and id
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: new Date().toISOString(),
      ...log,
    };

    this.logs.push(entry);
    if (this.logs.length > LOG_MAX) this.logs.shift();

    // write to file asynchronously (append + small rotation)
    try {
      fs.mkdirSync(path.dirname(PERSIST_FILE), { recursive: true });
      fs.appendFile(PERSIST_FILE, JSON.stringify(entry) + "\n", () => {});
    } catch (e) {
      // ignore file errors in dev
    }

    // broadcast to subscribers
    for (const cb of this.subscribers) {
      try { cb(entry); } catch (e) { /* ignore per-client errors */ }
    }

    return entry;
  }

  logIncoming(reqInfo) {
    return this._push({ type: "incoming-request", payload: reqInfo });
  }

  logDnsLookup(payload) {
    return this._push({ type: "dns-lookup", payload });
  }

  logRuleHit(payload) {
    return this._push({ type: "rule-hit", payload });
  }

  logSslToggle(payload) {
    return this._push({ type: "ssl-toggle", payload });
  }

  list({ limit = 200 } = {}) {
    return this.logs.slice(-limit);
  }

  clear() {
    this.logs = [];
    try { fs.unlinkSync(PERSIST_FILE); } catch (e) {}
  }

  subscribe(cb) {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }
}

export default new Logger();
