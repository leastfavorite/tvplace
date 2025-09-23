import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'

import * as z from 'zod'

import settings from './place.config.json'
import { getPixels } from './actions/pixels'
import { Sessions } from './utils/sessions'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

const Color = z.int().gte(0).lt(settings.colors.length)
const Index = z
  .int()
  .gte(0)
  .lt(settings.width * settings.height)

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const sessions = new Sessions()

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer)

  io.on('connect', (socket) => {
    const addr = socket.client.conn.remoteAddress
    const token = socket.handshake.auth.token

    if (!token) {
      socket.disconnect(true)
      return
    }
    socket.join(token)

    const cooldown = sessions.connect(token)
    socket.on('disconnect', () => sessions.disconnect(token))

    if (cooldown) {
      socket.emit('c', cooldown)
    }

    const refresh = () => socket.emit('r', getPixels().packed.buffer)

    socket.on('p', (c, i) => {
      const color = Color.parse(c)
      const index = Index.parse(i)

      const [shouldPlace, cooldown] = sessions.place(token, addr)
      if (shouldPlace) {
        getPixels().setPixel(color, index)
        io.emit('p', color, index)
        io.to(token).emit('c', cooldown || 0)
      } else if (cooldown) {
        socket.emit('c', cooldown)
      } else {
        socket.emit('e', 'Your IP is being rate-limited due to high activity.')
      }
    })

    socket.on('r', refresh)
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
