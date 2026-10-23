import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const coupleSettings = await prisma.coupleSettings.findUnique({
      where: { id: "couple-singleton" },
      select: {
        spotifyPlaylistUrl: true,
        partner1Name: true,
        partner2Name: true,
      },
    });

    const [partner1, partner2] = await Promise.all([
      prisma.user.findFirst({
        where: { role: "partner1" },
        select: { id: true, name: true, spotifyProfileUrl: true, avatarUrl: true },
      }),
      prisma.user.findFirst({
        where: { role: "partner2" },
        select: { id: true, name: true, spotifyProfileUrl: true, avatarUrl: true },
      }),
    ]);

    const songs = await prisma.song.findMany({
      include: {
        addedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      playlistUrl:
        coupleSettings?.spotifyPlaylistUrl ||
        "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
      partner1,
      partner2,
      songs,
    });
  } catch (error) {
    console.error("Spotify Playlist GET error:", error);
    return NextResponse.json({ error: "Failed to fetch Spotify playlist info" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { playlistUrl } = body;

    if (!playlistUrl || typeof playlistUrl !== "string") {
      return NextResponse.json({ error: "Invalid playlist URL" }, { status: 400 });
    }

    const updated = await prisma.coupleSettings.update({
      where: { id: "couple-singleton" },
      data: { spotifyPlaylistUrl: playlistUrl.trim() },
    });

    return NextResponse.json({ success: true, playlistUrl: updated.spotifyPlaylistUrl });
  } catch (error) {
    console.error("Spotify Playlist POST error:", error);
    return NextResponse.json({ error: "Failed to update Spotify playlist" }, { status: 500 });
  }
}
