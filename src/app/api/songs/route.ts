import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const songs = await prisma.song.findMany({
      include: {
        addedBy: { select: { id: true, name: true, nickname: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("Songs GET error:", error);
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, artist, spotifyUrl, youtubeUrl, note, coverUrl } = body;

    if (!title || !artist) {
      return NextResponse.json({ error: "Song title and artist are required." }, { status: 400 });
    }

    const song = await prisma.song.create({
      data: {
        title,
        artist,
        spotifyUrl: spotifyUrl || null,
        youtubeUrl: youtubeUrl || null,
        note: note || null,
        coverUrl: coverUrl || null,
        addedById: user.id,
      },
      include: {
        addedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ success: true, song });
  } catch (error) {
    console.error("Songs POST error:", error);
    return NextResponse.json({ error: "Failed to add song" }, { status: 500 });
  }
}
