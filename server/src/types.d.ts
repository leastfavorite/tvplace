// socket.io
interface ClientToServerEvents {
  p: (c: number, i: number) => void
  r: () => void
}

interface ServerToClientEvents {
  p: (c: number, i: number) => void
  r: (a: ArrayBufferLike) => void
  c: (c: number) => void
  e: (e: string) => void
}
