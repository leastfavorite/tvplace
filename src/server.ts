import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

import settings from "./place.config.json";

// onConnect:
// server sends client past 5m of map updates
// p: pixel(s)
// r: refresh

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    // ...
    console.log("got socket connection!");

    const randomPixel = () => [
      Math.floor(Math.random() * settings.width * settings.height),
      Math.floor(Math.random() * settings.colors.length),
    ];

    const interval = setInterval(() => {
      socket.emit("p", randomPixel());
    }, 1000);

    socket.on("disconnect", () => clearInterval(interval));
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
