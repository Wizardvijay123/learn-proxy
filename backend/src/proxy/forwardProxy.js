// backend/src/proxy/forwardProxy.js
import http from "http";
import net from "net";
import url from "url";
import fs from "fs";
import path from "path";
import httpProxy from "http-proxy";

const LOG_DIR = path.join(process.cwd(), "backend", "logs");
const LOG_FILE = path.join(LOG_DIR, "forward-proxy.log");

// Create logs folder if not exists
fs.mkdirSync(LOG_DIR, { recursive: true });

// Create http-proxy instance (for HTTP requests only)
const proxy = httpProxy.createProxyServer({});

// Log proxy errors
proxy.on("error", (err) => {
  console.error("Proxy Error:", err.message);
  fs.appendFileSync(LOG_FILE, `[ERROR] ${err.message}\n`);
});

// Add CORS bypass
proxy.on("proxyRes", (proxyRes, req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
});

/**
 * START FORWARD PROXY (HTTP + HTTPS)
 */
export function startForwardProxy(PORT = 8081) {
  const server = http.createServer((req, res) => {
    const fullUrl = req.url.startsWith("http")
      ? req.url
      : `http://${req.headers.host}${req.url}`;

    const now = new Date().toISOString();

    fs.appendFileSync(
      LOG_FILE,
      `[HTTP] ${now} - ${req.method} ${fullUrl} UA=${req.headers["user-agent"]}\n`
    );

    // Preflight CORS
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      });
      return res.end();
    }

    // Use http-proxy for HTTP
    const parsed = new URL(fullUrl);
    const target = `${parsed.protocol}//${parsed.host}`;

    proxy.web(req, res, { target, changeOrigin: true });
  });

  /**
   * HANDLE HTTPS CONNECT (TUNNELING)
   */
  server.on("connect", (req, clientSocket, head) => {
    const now = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[CONNECT] ${now} - ${req.url}\n`);

    const { hostname, port } = url.parse(`http://${req.url}`);

    // Create tunnel to target server
    const serverSocket = net.connect(port || 443, hostname, () => {
      // Respond OK to the client
      clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");

      // Pipe encrypted data between client <-> server
      serverSocket.write(head);
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });

    serverSocket.on("error", (err) => {
      fs.appendFileSync(
        LOG_FILE,
        `[CONNECT ERROR] ${now} - ${req.url} - ${err.message}\n`
      );
      clientSocket.end("HTTP/1.1 500 Connection Error\r\n");
    });
  });

  server.listen(PORT, () => {
    console.log(`🚀 Forward Proxy running at http://localhost:${PORT}`);
  });
}
