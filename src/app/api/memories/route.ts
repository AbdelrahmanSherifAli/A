import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const surprise = searchParams.get("surprise");
    const onThisDay = searchParams.get("onThisDay");

    if (surprise === "true") {
      const count = await prisma.memory.count();
      if (count === 0) return NextResponse.json({ memory: null });
      const skip = Math.floor(Math.random() * count);
      const randomMemory = await prisma.memory.findFirst({
        skip,
        include: {
          author: { select: { id: true, name: true, nickname: true, avatarUrl: true } },
        },
      });
      return NextResponse.json({ memory: randomMemory });
    }

    if (onThisDay === "true") {
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentDay = now.getDate();

      const allMemories = await prisma.memory.findMany({
        include: {
          author: { select: { id: true, name: true, nickname: true, avatarUrl: true } },
        },
        orderBy: { memoryDate: "desc" },
      });

      // Filter memories matching current month & day from prior years
      const matchingMemories = allMemories.filter((m) => {
        const memDate = new Date(m.memoryDate);
        return (
          memDate.getMonth() + 1 === currentMonth &&
          memDate.getDate() === currentDay &&
          memDate.getFullYear() < now.getFullYear()
        );
      });

      if (matchingMemories.length > 0) {
        return NextResponse.json({
          memory: matchingMemories[0],
          isExactAnniversary: true,
        });
      }

      // If no memory on this exact calendar day, return the most recent or favorite memory
      const fallbackMemory = allMemories.find((m) => m.isFavorite) || allMemories[0] || null;
      return NextResponse.json({
        memory: fallbackMemory,
        isExactAnniversary: false,
      });
    }

    const memories = await prisma.memory.findMany({
      include: {
        author: { select: { id: true, name: true, nickname: true, avatarUrl: true } },
      },
      orderBy: { memoryDate: "desc" },
    });

    return NextResponse.json({ memories });
  } catch (error) {
    console.error("Memories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      memoryDate,
      timeOfDay,
      location,
      mood,
      tags,
      photos,
      audioUrl,
      videoUrl,
      songTitle,
      songArtist,
      songUrl,
      addToTimeline,
    } = body;

    if (!title || !description || !memoryDate) {
      return NextResponse.json(
        { error: "Title, description, and date are required." },
        { status: 400 }
      );
    }

    const dateObj = new Date(memoryDate);

    const memory = await prisma.memory.create({
      data: {
        title,
        description,
        memoryDate: dateObj,
        timeOfDay: timeOfDay || null,
        location: location || null,
        mood: mood || "romantic",
        tags: tags || null,
        authorId: user.id,
        photos: photos ? JSON.stringify(photos) : null,
        audioUrl: audioUrl || null,
        videoUrl: videoUrl || null,
        songTitle: songTitle || null,
        songArtist: songArtist || null,
        songUrl: songUrl || null,
      },
      include: {
        author: { select: { id: true, name: true, nickname: true, avatarUrl: true } },
      },
    });

    if (addToTimeline) {
      await prisma.timelineEvent.create({
        data: {
          year: dateObj.getFullYear(),
          title: title,
          description: description,
          eventDate: dateObj,
          category: mood === "trip" ? "trip" : "milestone",
          location: location || null,
          photos: photos ? JSON.stringify(photos) : null,
          songUrl: songUrl || null,
          authorId: user.id,
          memoryId: memory.id,
        },
      });
    }

    return NextResponse.json({ success: true, memory });
  } catch (error) {
    console.error("Memories POST error:", error);
    return NextResponse.json({ error: "Failed to create memory" }, { status: 500 });
  }
}
