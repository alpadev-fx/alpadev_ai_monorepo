/**
 * Custom Next.js server with WebSocket support for live chat.
 *
 * Usage:
 *   Development: node --import tsx server.ts
 *   Production: NODE_ENV=production node server.ts
 *
 * The WebSocket server runs on the same HTTP server as Next.js,
 * handling upgrade requests on the /ws path.
 */
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import type { ChatEvent } from "../../packages/api/src/routers/chat/chat.service";

// Dynamic import to handle ESM/CJS interop with tsx loader
const loadChatService = async () => {
  const mod = await import("../../packages/api/src/routers/chat/chat.service");
  return (mod.getChatService || (mod as any).default?.getChatService)();
};

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface WSClient {
  ws: WebSocket;
  roomId?: string;
  visitorId?: string;
  isAgent?: boolean;
}

app.prepare().then(async () => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url || "", true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });
  const clients: Set<WSClient> = new Set();
  const chatService = await loadChatService();

  // Subscribe to all chat events and broadcast to relevant WebSocket clients
  chatService.subscribeGlobal((event: ChatEvent) => {
    const payload = JSON.stringify(event);

    for (const client of Array.from(clients)) {
      if (client.ws.readyState !== WebSocket.OPEN) continue;

      // Send to clients subscribed to this room
      if (client.roomId === event.roomId) {
        client.ws.send(payload);
      }

      // Send room events to all agents (for dashboard)
      if (
        client.isAgent &&
        (event.type === "room.created" ||
         event.type === "room.statusChange" ||
         event.type === "handoff.reminder" ||
         event.type === "handoff.timeout" ||
         event.type === "handoff.cancelled" ||
         event.type === "booking.created" ||
         event.type === "whatsapp.link_sent")
      ) {
        client.ws.send(payload);
      }
    }
  });

  // Handle WebSocket upgrade
  server.on("upgrade", (request, socket, head) => {
    const { pathname } = parse(request.url || "", true);

    if (pathname === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Handle WebSocket connections
  wss.on("connection", (ws: WebSocket) => {
    const client: WSClient = { ws };
    clients.add(client);

    ws.on("message", (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());

        switch (msg.type) {
          case "subscribe": {
            // Subscribe to a specific room
            client.roomId = msg.roomId;
            client.visitorId = msg.visitorId;
            break;
          }
          case "subscribe.agent": {
            // Agent subscribes to all room events
            client.isAgent = true;
            if (msg.roomId) {
              client.roomId = msg.roomId;
            }
            break;
          }
          case "unsubscribe": {
            client.roomId = undefined;
            break;
          }
          case "ping": {
            ws.send(JSON.stringify({ type: "pong" }));
            break;
          }
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on("close", () => {
      clients.delete(client);
    });

    // Send connection confirmation
    ws.send(JSON.stringify({ type: "connected" }));
  });

  server.listen(port, () => {
    console.log(
      `> Ready on http://${hostname}:${port} (WebSocket on ws://${hostname}:${port}/ws)`
    );
  });
});
