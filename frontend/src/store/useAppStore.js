import { create } from "zustand";
import { attachToken, createSocket } from "../lib/api";

const tokenStorage = localStorage.getItem("uno_token") || "";
const usernameStorage = localStorage.getItem("uno_username") || "";

export const useAppStore = create((set, get) => ({
  token: tokenStorage,
  username: usernameStorage,
  socket: null,
  gameState: null,
  hand: [],

  setAuth: ({ token, username }) => {
    localStorage.setItem("uno_token", token);
    localStorage.setItem("uno_username", username);
    attachToken(token);
    set({ token, username });
  },

  clearAuth: () => {
    localStorage.removeItem("uno_token");
    localStorage.removeItem("uno_username");
    attachToken(null);
    set({ token: "", username: "" });
  },

  connectSocket: () => {
    const current = get().socket;
    if (current) return current;
    const socket = createSocket();
    set({ socket });
    return socket;
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) socket.disconnect();
    set({ socket: null });
  },

  setGameState: (gameState) => set({ gameState }),
  setHand: (hand) => set({ hand }),
}));

attachToken(tokenStorage || null);
