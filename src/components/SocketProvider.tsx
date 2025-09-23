'use client'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { io, Socket as IoSocket } from 'socket.io-client'

type Socket = IoSocket<ServerToClientEvents, ClientToServerEvents>

const SocketContext = createContext<Socket | null>(null)

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const socketRef = useRef<Socket>(null)

  useEffect(() => {
    let socket: Socket;
    if (!socketRef.current) {
      socket = io()
      socketRef.current = socket
      setSocket(socketRef.current)
    }
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null)
      }
    }
  }, [])
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}

export interface UseEventArgs {
  name: string
}

// if this were enterprise code i would not disable the typechecking like this.
// i would slack my boss about it, and i would pray he has the cunning and wit
// to slay this hydra
export function useEvent<K extends keyof ServerToClientEvents>(name: K, on: ServerToClientEvents[K]) {

  const socket = useContext(SocketContext)
  useEffect(() => {
    if (socket) {
      // eslint-disable-next-line
      socket.on(name, on as any)
    }

    return () => {
      // eslint-disable-next-line
      socket?.off(name, on as any)
    }
  }, [socket, on, name])
}

export const useSocket = (): Socket | null => {
  return useContext(SocketContext)
}
