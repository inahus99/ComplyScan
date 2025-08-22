const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { scanSite } = require('./scanSite');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL] // e.g. https://complyscan.example.com
    : ['http://localhost:5173', 'http://localhost:1234']; // Vite/Parcel

app.use(cors({ origin: allowedOrigins, methods: ['GET','POST'], credentials: true }));

app.get('/health', (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));

const io = new Server(server, {
  path: '/socket.io',
  transports: ['websocket'],     // force WS (no silent polling fallback)
  cors: { origin: allowedOrigins, methods: ['GET','POST'], credentials: true },
  pingInterval: 25000,
  pingTimeout: 60000
});

io.engine.on('connection_error', (e) =>
  console.error('socket engine error:', e.code, e.message)
);

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('start_scan', async (payload, ack) => {
    try {
      if (typeof ack === 'function') ack({ ok: true });
      await scanSite({
        url: payload?.url,
        socket,
        options: payload?.options
      });
    } catch (err) {
      console.error('scanSite error:', err);
      socket.emit('scan_error', { message: err?.message || 'Unknown error' });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('socket disconnected', socket.id, reason);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
