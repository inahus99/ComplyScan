// client/src/lib/socket.js
import { io } from "socket.io-client";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://<your-railway-app>.up.railway.app"; // TODO: set your prod URL

export const socket = io(BASE_URL, {
  path: "/socket.io",
  transports: ["websocket"],
  reconnection: true,
  withCredentials: true,
});

// small helper to attach & auto-clean
export function on(event, fn) {
  socket.on(event, fn);
  return () => socket.off(event, fn);
}
