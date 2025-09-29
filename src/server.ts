import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'

import * as z from 'zod'

import settings from './place.config.json'
import { Sessions } from './utils/sessions'
import { PixelGrid } from './utils/pixels'
import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'

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

// TODO create API endpoint for PNG
// TODO create script hookup for uploading images (can be in other docker container)
// TODO make default color for loading bar thing
// TODO remove magic paths
// TODO support cloudflare proxy

let inputBoard
try {
  inputBoard = readFileSync('data/board.bin')
} catch {
  inputBoard = undefined
}

const pixels = new PixelGrid({
  width: settings.width,
  height: settings.height,
  colors: settings.colors,
  init: inputBoard?.buffer,
})

let imageChanged = false
const saveImage = async () => {
  if (!imageChanged) return
  await Promise.all([
    sharp(pixels.unpacked, {
      raw: {
        width: settings.width,
        height: settings.height,
        channels: 4,
      },
    })
      .png()
      .toFile('data/board.png'),
    writeFile('data/board.bin', pixels.packed),
  ])
  imageChanged = false
}

setInterval(saveImage, 5000)

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

    const refresh = () => socket.emit('r', pixels.packed.buffer)

    socket.on('p', (c, i) => {
      const color = Color.parse(c)
      const index = Index.parse(i)

      const [shouldPlace, cooldown] = sessions.place(token, addr)
      if (shouldPlace) {
        pixels.setPixel(color, index)
        io.emit('p', color, index)
        io.to(token).emit('c', cooldown || 0)
        imageChanged = true
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
