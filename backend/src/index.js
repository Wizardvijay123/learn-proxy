import express from "express";
import cors from "cors";
import { startForwardProxy } from "./proxy/forwardProxy.js";

const app = express();
app.use(cors());
app.use(express.json());

// API route
app.get("/", (req, res) => {
  res.json({
    message: "Proxy Visualizer Backend Running",
  });
});

// Start forward proxy on 8081
startForwardProxy(8081);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🌐 Backend API running on http://localhost:${PORT}`);
});
