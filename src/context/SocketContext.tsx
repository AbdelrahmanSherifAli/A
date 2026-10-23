"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  onlineUserIds: string[];
  isPartnerOnline: boolean;
  partnerTyping: boolean;
  sendTypingStatus: (isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUserIds: [],
  isPartnerOnline: false,
  partnerTyping: false,
  sendTypingStatus: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, partner } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [partnerTyping, setPartnerTyping] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketInstance = io(typeof window !== "undefined" ? window.location.origin : "", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      socketInstance.emit("register_user", user.id);
    });

    socketInstance.on("presence_change", (data: { onlineUserIds: string[] }) => {
      setOnlineUserIds(data.onlineUserIds || []);
    });

    socketInstance.on("user_typing", (data: { userId: string; isTyping: boolean }) => {
      if (partner && data.userId === partner.id) {
        setPartnerTyping(data.isTyping);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id, partner?.id]);

  const isPartnerOnline = Boolean(partner && onlineUserIds.includes(partner.id));

  const sendTypingStatus = (isTyping: boolean) => {
    if (socket && user) {
      socket.emit("typing", { userId: user.id, isTyping });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUserIds,
        isPartnerOnline,
        partnerTyping,
        sendTypingStatus,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
