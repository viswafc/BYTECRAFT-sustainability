import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './routes/api';
import { setupWebSocketServer } from './websocket/stream';

export const PORT = 3000;
export const HOST = '0.0.0.0';

export async function createBackendApp() {
  const app = express();
  app.use(express.json());

  // Mount API routes
  app.use('/api', apiRouter);

  // Vite middleware in dev; static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

export async function startServer() {
  const app = await createBackendApp();
  const server = http.createServer(app);

  // Attach WebSocket streaming
  setupWebSocketServer(server);

  server.listen(PORT, HOST, () => {
    console.log(`AquaRisk AI Backend Server running on http://${HOST}:${PORT}`);
  });

  return server;
}
