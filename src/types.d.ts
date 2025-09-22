// socket.io
interface ClientToServerEvents {
  p: (c: number, i: number, callback: (t: number) => void) => void,
  r: () => void
}

interface ServerToClientEvents {
  p: (c: number, i: number) => void
  r: (a: ArrayBufferLike) => void
}
