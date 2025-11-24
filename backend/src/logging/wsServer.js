import { WebSocketServer } from "ws";
import logger from "./logger.js";

export function startWs(httpServer) {
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws/logs",
  });

  console.log("WebSocket Log Server running at ws://localhost:8080/ws/logs");

  // When client connects
  wss.on("connection", (socket) => {
    console.log("Client connected to log stream");

    // Send snapshot
    socket.send(
      JSON.stringify({
        type: "snapshot",
        logs: logger.list({ limit: 100 }),
      })
    );

    // Subscribe to real-time logs
    const unsubscribe = logger.subscribe((entry) => {
      socket.send(JSON.stringify({ type: "log", entry }));
    });

    // On disconnect, clean up
    socket.on("close", () => {
      unsubscribe();
    });
  });
}
