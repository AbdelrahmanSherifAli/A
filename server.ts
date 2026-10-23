import express from "express";
import http from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

const port = parseInt(process.env.PORT || "3000", 10);

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve static files from public/uploads
  server.use("/uploads", express.static(uploadsDir));

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const activeUsers = new Map<string, string>(); // userId -> socketId

  io.on("connection", (socket) => {
    socket.on("register_user", (userId: string) => {
      activeUsers.set(userId, socket.id);
      socket.join("couple_universe");
      io.to("couple_universe").emit("presence_change", {
        onlineUserIds: Array.from(activeUsers.keys()),
      });
    });

    const handleNewMessage = async (data: {
      senderId: string;
      text?: string;
      mediaUrl?: string;
      mediaType?: string;
      planId?: string;
    }) => {
      try {
        const planKey = data.planId ? `plan:${data.planId}` : null;
        const savedMessage = await prisma.chatMessage.create({
          data: {
            senderId: data.senderId,
            text: data.text || null,
            mediaUrl: data.mediaUrl || null,
            mediaType: data.mediaType || null,
            replyToId: planKey,
            isRead: false,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                nickname: true,
                avatarUrl: true,
              },
            },
          },
        });

        io.to("couple_universe").emit("new_message", {
          ...savedMessage,
          planId: data.planId || null,
        });
      } catch (err) {
        console.error("Failed to save chat message:", err);
      }
    };

    socket.on("chat_message", handleNewMessage);
    socket.on("send_message", handleNewMessage);

    socket.on("typing", (data: { userId: string; isTyping: boolean }) => {
      socket.to("couple_universe").emit("user_typing", data);
    });

    socket.on("react_message", async (data: { messageId: string; emoji: string; userId: string }) => {
      try {
        const msg = await prisma.chatMessage.findUnique({
          where: { id: data.messageId },
        });
        if (!msg) return;

        let reactions: Record<string, string[]> = {};
        if (msg.reactions) {
          try {
            reactions = JSON.parse(msg.reactions);
          } catch {
            reactions = {};
          }
        }

        const userList = reactions[data.emoji] || [];
        if (userList.includes(data.userId)) {
          // Remove reaction if already present (toggle)
          reactions[data.emoji] = userList.filter((id) => id !== data.userId);
          if (reactions[data.emoji].length === 0) {
            delete reactions[data.emoji];
          }
        } else {
          // Add reaction
          reactions[data.emoji] = [...userList, data.userId];
        }

        const updated = await prisma.chatMessage.update({
          where: { id: data.messageId },
          data: { reactions: JSON.stringify(reactions) },
          include: {
            sender: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        });

        io.to("couple_universe").emit("message_updated", updated);
      } catch (err) {
        console.error("Failed to react to message:", err);
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, sockId] of activeUsers.entries()) {
        if (sockId === socket.id) {
          activeUsers.delete(userId);
          break;
        }
      }
      io.to("couple_universe").emit("presence_change", {
        onlineUserIds: Array.from(activeUsers.keys()),
      });
    });
  });

  // Next.js handles all other requests
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`> Our Story luxury sanctuary ready on http://localhost:${port}`);
  });
});
