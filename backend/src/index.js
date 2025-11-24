// backend/src/index.js
import sslRoutes from "./ssl/sslRoutes.js";
import express from "express";
import cors from "cors";

// Logging system
import logger from "./logging/logger.js";
import logRoutes from "./logging/logRoutes.js";
import { startWs } from "./logging/wsServer.js";

// DNS + Firewall
import dnsRoutes from "./dns/dnsRoutes.js";
import firewallRoutes from "./firewall/firewallRoutes.js";
import { firewallMiddleware } from "./firewall/index.js";

const app = express();
app.use(cors());
app.use(express.json());

/* ----------------------
   Incoming Request Logger
-------------------------*/
app.use((req, res, next) => {
  logger.logIncoming({
    method: req.method,
    path: req.path,
    ip: req.ip,
    host: req.headers.host,
  });
  next();
});

/* ----------------------
    MANAGEMENT ROUTES
-------------------------*/
app.use("/logs", logRoutes);
app.use("/dns", dnsRoutes);
app.use("/firewall", firewallRoutes);
app.use("/ssl", sslRoutes);

/* ----------------------
    FIREWALL MIDDLEWARE
-------------------------*/
app.use(firewallMiddleware);

/* ----------------------
    ROOT
-------------------------*/
app.get("/", (req, res) => {
  res.json({ message: "Proxy Visualizer Backend Running" });
});

/* ----------------------
    SERVER + WEBSOCKET
-------------------------*/
const PORT = 8080;
const server = app.listen(PORT, () => {
  console.log(`Backend API running at http://localhost:${PORT}`);
});

// Start WebSocket log server
startWs(server);
