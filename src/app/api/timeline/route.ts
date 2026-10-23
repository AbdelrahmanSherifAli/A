import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.timelineEvent.findMany({
      include: {
        author: { select: { id: true, name: true, nickname: true, avatarUrl: true } },
        memory: true,
      },
      orderBy: { eventDate: "asc" },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Timeline GET error:", error);
    return NextResponse.json({ error: "Failed to fetch timeline" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, eventDate, category, location, photos, songUrl } = body;

    if (!title || !description || !eventDate) {
      return NextResponse.json({ error: "Title, description, and event date are required" }, { status: 400 });
    }

    const dateObj = new Date(eventDate);
    const event = await prisma.timelineEvent.create({
      data: {
        title,
        description,
        eventDate: dateObj,
        year: dateObj.getFullYear(),
        category: category || "milestone",
        location: location || null,
        photos: photos ? JSON.stringify(photos) : null,
        songUrl: songUrl || null,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Timeline POST error:", error);
    return NextResponse.json({ error: "Failed to create timeline event" }, { status: 500 });
  }
}
