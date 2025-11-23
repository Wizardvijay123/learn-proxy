//src/index.js
import express from "express";
import cors from "cors";
import dnsRoutes from "./dns/dnsRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// mount dns
app.use("/dns", dnsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Proxy Visualizer Backend Running" });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});

