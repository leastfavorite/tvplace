import { createServer } from "http";
import { Server } from "socket.io";

import settings from "../place.config.json" with { type: "json" };

// todo get this from some settings.json
const img = new Uint8Array((settings.width * settings.height) / 2);
img.fill(7);

const httpServer = createServer();
const io = new Server(httpServer, {});

io.on("connection", (socket) => {});
