import { sveltekit } from "@sveltejs/kit/vite";
import { type ViteDevServer, defineConfig } from "vite";
import { Server } from "socket.io";
import type { Item } from "$lib/types";

const webSocketServer = {
  name: "webSocketServer",
  configureServer(server: ViteDevServer) {
    if (!server.httpServer) return;

    const io = new Server(server.httpServer);

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      socket.emit("eventFromServer", "Hello, World 👋");

      socket.on("submit-word", (item: Item) => {
        console.log("submit-word", item);
        io.emit("word-submitted", item);
      });
    });
  },
};

export default defineConfig({
  plugins: [sveltekit(), webSocketServer],
});
