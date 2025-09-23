import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'

import * as z from "zod";

import settings from './place.config.json'
import { getPixels } from './actions/pixels'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents
  >(httpServer)

  const Color = z.int().gte(0).lt(settings.colors.length)
  const Index = z.int().gte(0).lt(settings.width * settings.height)

  io.on('connection', (socket) => {

    const refresh = () => socket.emit("r", getPixels().packed.buffer)

    let updateTime = Date.now();
    socket.on("p", (c, i, callback) => {

      if (Date.now() >= updateTime) {
        const color = Color.parse(c);
        const index = Index.parse(i);

        getPixels().setPixel(color, index);
        io.emit("p", color, index);

        updateTime = Date.now() + settings.cooldown * 1000;
      }
      callback(updateTime)
    })

    socket.on("r", refresh)
    refresh()
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
