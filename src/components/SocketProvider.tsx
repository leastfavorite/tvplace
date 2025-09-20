'use client'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { io, Socket } from 'socket.io-client'

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

      socket.on('connect', () => console.log('connected!'))
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
export function useEvent<T>(name: string, on: (...args: any[]) => void) {

  const socket = useContext(SocketContext)
  useEffect(() => {
    if (socket) {
      socket.on(name, on)
    }

    return () => {
      socket?.off(name, on)
    }
  }, [socket, on, name])
}

export const useSocket = (): Socket | null => {
  return useContext(SocketContext)
}
