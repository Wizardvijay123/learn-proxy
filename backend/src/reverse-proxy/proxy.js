

// proxy.js
// Simple reverse proxy with path routing and round-robin load balancing
const express = require('express');
const http = require('http');
const httpProxy = require('http-proxy');

const app = express();
const server = http.createServer(app);
const proxy = httpProxy.createProxyServer({});

// Map of routePrefix -> { targets: [..], idx: number }
const routes = {
  '/api': {
    targets: ['http://localhost:9000', 'http://localhost:9002'], // you can add many
    idx: 0
  },
  '/auth': {
    targets: ['http://localhost:9001'],
    idx: 0
  }
};

// helper: pick next target using round-robin
function pickTarget(routeKey) {
  const r = routes[routeKey];
  if (!r || r.targets.length === 0) return null;
  const target = r.targets[r.idx % r.targets.length];
  r.idx = (r.idx + 1) % r.targets.length;
  return target;
}

// helper: find which route matches request path (longest prefix match)
function findRouteKey(path) {
  // Prefer longest matching prefix (so '/api/v1' matches '/api' not '/')
  const keys = Object.keys(routes).sort((a,b) => b.length - a.length);
  for (const k of keys) {
    if (path === k || path.startsWith(k + '/') ) return k;
  }
  return null;
}

// Middleware to proxy matched routes
app.use((req, res, next) => {
  const routeKey = findRouteKey(req.path);
  if (!routeKey) return next(); // no match — let express handle or 404

  const target = pickTarget(routeKey);
  if (!target) {
    res.statusCode = 502;
    return res.end('Bad gateway - no targets configured');
  }

  // Optionally rewrite path (if backend expects root)
  // Example: forward /api/users -> /users on backend
  // const newPath = req.path.replace(routeKey, '') || '/';
  // req.url = newPath + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');

  // Preserve original host header? You can choose:
  req.headers['x-forwarded-for'] = (req.headers['x-forwarded-for'] || '') + (req.connection.remoteAddress ? `,${req.connection.remoteAddress}` : '');
  req.headers['x-forwarded-proto'] = req.protocol || (req.connection.encrypted ? 'https' : 'http');

  proxy.web(req, res, { target, changeOrigin: true }, (err) => {
    console.error('Proxy web error:', err && err.message);
    if (!res.headersSent) {
      res.statusCode = 502;
      res.end('Bad gateway (proxy error)');
    } else {
      // if headers already sent, just destroy connection
      res.destroy();
    }
  });
});

// Optional: static fallback or general route
app.use(express.static('public'));
app.use((req, res) => {
  res.status(404).send('Not found on proxy');
});

// Handle websocket upgrades (important if backends use ws)
server.on('upgrade', (req, socket, head) => {
  const routeKey = findRouteKey(req.url || req.path || '/');
  if (!routeKey) {
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
    return;
  }
  const target = pickTarget(routeKey);
  if (!target) {
    socket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
    socket.destroy();
    return;
  }

  proxy.ws(req, socket, head, { target }, (err) => {
    console.error('Proxy ws error:', err && err.message);
    try { socket.destroy(); } catch (e) {}
  });
});

// Basic logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.originalUrl}`);
  next();
});

const PORT = 8080;
server.listen(PORT, () => console.log(`Reverse proxy listening on ${PORT}`));

// Optional: graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down proxy...');
  server.close(() => process.exit(0));
});




