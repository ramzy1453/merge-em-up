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
      socket.broadcast.emit("join-room");

      socket.on("submit-word", (item: Item) => {
        console.log("submit-word", item);
        socket.broadcast.emit("word-submitted", item);
      });

      socket.on("merge-word", (item: Item) => {
        console.log("merge-word", item);
        socket.broadcast.emit("word-merged", item);
      });
    });
  },
};

export default defineConfig({
  plugins: [sveltekit(), webSocketServer],
});
