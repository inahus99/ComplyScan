const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const { scanSite } = require("./scanner");

dotenv.config();
const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.get("/", (_, res) => res.send("GDPR Checker server is running."));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:5173"], methods: ["GET", "POST"] }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("start_scan", async ({ url, options }) => {
    if (!url || !/^https?:\/\//i.test(url)) {
      socket.emit("scan_error", { message: "Please provide a valid URL with http/https." });
      return;
    }
    try {
      await scanSite({ url, socket, options: options || {} });
    } catch (err) {
      console.error("Scan error:", err);
      socket.emit("scan_error", { message: err.message || "Unknown scan error" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
