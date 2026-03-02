import axios from "axios";
import { io } from "socket.io-client";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export function attachToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function createSocket() {
  return io(WS_BASE_URL, { transports: ["websocket"] });
}
