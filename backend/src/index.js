//src/index.js
// backend/src/index.js
import express from "express";
import cors from "cors";

import dnsRoutes from "./dns/dnsRoutes.js";
import firewallRoutes from "./firewall/firewallRoutes.js";
import { firewallMiddleware } from "./firewall/index.js";

// your future proxy middleware
// import proxyMiddleware from "./proxy/proxy.js";

const app = express();
app.use(cors());
app.use(express.json());

// Management APIs
app.use("/dns", dnsRoutes);
app.use("/firewall", firewallRoutes);

// IMPORTANT: firewall must come BEFORE proxy
app.use(firewallMiddleware);

// Later your proxy will be here
// app.use("/", proxyMiddleware);

app.get("/", (req, res) => {
  res.json({ message: "Proxy Visualizer Backend Running" });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});

