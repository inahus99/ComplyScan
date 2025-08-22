
import { io } from "socket.io-client";
const BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "" 
  );
export const socket = io(BASE_URL, {
  path: "/socket.io",
  transports: ["websocket"],
  reconnection: true,
  withCredentials: true,
});
export function on(event, fn) {
  socket.on(event, fn);
  return () => socket.off(event, fn);
}
