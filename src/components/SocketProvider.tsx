"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket>(null);

  useEffect(() => {
    if (!socketRef.current) {
      const socket = io();
      socketRef.current = socket;
      setSocket(socket);

      socket.on("connect", () => console.log("connected!"));
    }
    () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setSocket(null);
      }
    };
  }, []);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export interface UseEventArgs {
  name: string;
}
export const useEvent = (name: string, on: (...arg: any) => void) => {
  const socket = useContext(SocketContext);
  useEffect(() => {
    if (socket) {
      socket.on(name, on);
    }

    return () => {
      socket?.off(name, on);
    };
  }, [socket]);
};

export const useSocket = (): Socket | null => {
  return useContext(SocketContext);
};
