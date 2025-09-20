import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'

import * as z from "zod";

import settings from './place.config.json'
import { getPixels } from './actions/pixels'

// onConnect:
// server sends client past 5m of map updates
// p: pixel(s)
// r: refresh

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const io = new Server(httpServer)

  const Color = z.int().gte(0).lt(settings.colors.length)
  const Index = z.int().gte(0).lt(settings.width * settings.height)

  io.on('connection', (socket) => {

    socket.on("p", (c, i, callback) => {
      const color = Color.parse(c);
      const index = Index.parse(i);

      getPixels().setPixel(color, index);
      io.emit("p", color, index);
      callback(Date.now() + 15000)
    })

    socket.emit("r", getPixels().packed)
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
