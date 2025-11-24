// backend/src/firewall/index.js
import { listRules } from "./store.js";
import logger from "../logging/logger.js";

// Extract IP + Host + Port
function getReqInfo(req) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.ip ||
    req.connection?.remoteAddress;

  const host = req.headers.host?.split(":")[0];
  const port = Number(req.headers.host?.split(":")[1] || 80);

  return { ip, host, port };
}

// Firewall Middleware
export function firewallMiddleware(req, res, next) {
  const info = getReqInfo(req);
  const rules = listRules();

  // Log incoming traffic
  logger.logIncoming({
    method: req.method,
    path: req.originalUrl,
    ip: info.ip,
    host: info.host,
    port: info.port,
  });

  // Apply rules
  for (const r of rules) {
    if (!r.enabled) continue;

    // block-ip
    if (r.type === "block-ip" && info.ip === r.value) {
      logger.logRuleHit({
        ruleId: r.id,
        ruleType: r.type,
        ruleValue: r.value,
        ip: info.ip,
        path: req.originalUrl,
      });

      return res.status(403).json({
        ok: false,
        reason: `Blocked IP: ${r.value}`,
      });
    }

    // block-port
    if (r.type === "block-port" && String(info.port) === String(r.value)) {
      logger.logRuleHit({
        ruleId: r.id,
        ruleType: r.type,
        ruleValue: r.value,
        ip: info.ip,
        path: req.originalUrl,
      });

      return res.status(403).json({
        ok: false,
        reason: `Blocked Port: ${r.value}`,
      });
    }

    // allow-only
    if (r.type === "allow-only") {
      let allowed = Array.isArray(r.value)
        ? r.value
        : String(r.value).split(",").map((x) => x.trim());

      if (
        !allowed.includes(info.ip) &&
        !allowed.includes(info.host) &&
        !allowed.includes(String(info.port))
      ) {
        logger.logRuleHit({
          ruleId: r.id,
          ruleType: r.type,
          ruleValue: r.value,
          ip: info.ip,
          path: req.originalUrl,
        });

        return res.status(403).json({
          ok: false,
          reason: "Not in allow-only rule",
        });
      }
    }
  }

  next();
}
