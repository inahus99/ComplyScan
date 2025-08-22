import { io } from "socket.io-client";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : import.meta.env.VITE_BACKEND_URL;  

export const socket = io(BASE_URL, {
  path: "/socket.io",
  transports: ["websocket"],
  reconnection: true,
  withCredentials: true,
});
