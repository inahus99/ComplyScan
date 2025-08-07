const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { scanSite } = require('./scanSite')
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Allow local + prod origins
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [ process.env.FRONTEND_URL ]
  : [ 'http://localhost:5173' ];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET','POST'],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET','POST'],
    credentials: true
  }
});



io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  socket.on('start_scan', payload => {
    // payload = { url: string, options?: { maxPages, navigationTimeoutMs } }
    scanSite({ url: payload.url, socket, options: payload.options })
      .catch(err => {
        console.error('scanSite error:', err);
        socket.emit('scan_error', { message: err.message });
      });
  });

  socket.on('disconnect', reason => {
    console.log('Client disconnected:', socket.id, reason);
  });
});

// Start listening
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(` Server listening on port ${PORT}`);
});
