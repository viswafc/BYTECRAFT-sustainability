import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { telemetryService } from '../services/telemetryService';

export function setupWebSocketServer(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    try {
      const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      if (url.pathname === '/ws/telemetry') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    } catch {
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    // Send immediate initial packet upon connection
    sendTelemetryUpdate(ws, wss.clients.size);

    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        sendTelemetryUpdate(ws, wss.clients.size);
      }
    }, 2000);

    ws.on('close', () => {
      clearInterval(interval);
    });
  });

  return wss;
}

function sendTelemetryUpdate(ws: WebSocket, clientCount: number) {
  const payload = telemetryService.generateNextTelemetryFrame(clientCount);
  try {
    ws.send(JSON.stringify(payload));
  } catch {
    // Client closed
  }
}
