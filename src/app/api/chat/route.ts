import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("planId");

    const whereClause = planId ? { replyToId: `plan:${planId}` } : { replyToId: null };

    const rawMessages = await prisma.chatMessage.findMany({
      where: whereClause,
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
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    const messages = rawMessages.map((m) => ({
      ...m,
      planId: m.replyToId?.startsWith("plan:") ? m.replyToId.replace("plan:", "") : null,
    }));

    // Mark partner's unread messages as read
    await prisma.chatMessage.updateMany({
      where: {
        ...whereClause,
        senderId: { not: user.id },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { action, messageId, text, mediaUrl, mediaType, planId } = body;

    // Action 1: Save message as memory (Chat -> Memory loop)
    if (action === "save_as_memory") {
      if (!messageId) return NextResponse.json({ error: "Message ID required" }, { status: 400 });
      const targetMsg = await prisma.chatMessage.findUnique({
        where: { id: messageId },
        include: { sender: true },
      });
      if (!targetMsg) return NextResponse.json({ error: "Message not found" }, { status: 404 });

      const memory = await prisma.memory.create({
        data: {
          title: `Conversation snippet: ${targetMsg.text?.slice(0, 35) || "A sweet moment"}...`,
          description: targetMsg.text || "Saved from our private chat.",
          memoryDate: targetMsg.createdAt,
          location: "Private Chat",
          mood: "romantic",
          tags: "chat, moment, us",
          authorId: user.id,
          photos: targetMsg.mediaUrl ? JSON.stringify([targetMsg.mediaUrl]) : null,
        },
      });

      // Also create a timeline event
      await prisma.timelineEvent.create({
        data: {
          title: `Chat Moment: ${targetMsg.text?.slice(0, 30) || "Saved Conversation"}`,
          description: targetMsg.text || "Preserved from our late night chat.",
          eventDate: targetMsg.createdAt,
          year: new Date(targetMsg.createdAt).getFullYear(),
          category: "tiny_moment",
          authorId: user.id,
          memoryId: memory.id,
          photos: targetMsg.mediaUrl ? JSON.stringify([targetMsg.mediaUrl]) : null,
        },
      });

      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { savedToMemoryId: memory.id },
      });

      return NextResponse.json({ success: true, memory });
    }

    // Action 2: Toggle pin
    if (action === "pin") {
      if (!messageId) return NextResponse.json({ error: "Message ID required" }, { status: 400 });
      const targetMsg = await prisma.chatMessage.findUnique({ where: { id: messageId } });
      if (!targetMsg) return NextResponse.json({ error: "Message not found" }, { status: 404 });

      const updated = await prisma.chatMessage.update({
        where: { id: messageId },
        data: { isPinned: !targetMsg.isPinned },
      });
      return NextResponse.json({ success: true, message: updated });
    }

    // Action 3: Regular send message
    if (!text && !mediaUrl) {
      return NextResponse.json({ error: "Message must contain text or media" }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: user.id,
        text: text || null,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        replyToId: planId ? `plan:${planId}` : null,
        isRead: false,
      },
      include: {
        sender: {
          select: { id: true, name: true, nickname: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        ...message,
        planId: message.replyToId?.startsWith("plan:") ? message.replyToId.replace("plan:", "") : null,
      },
    });
  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}
