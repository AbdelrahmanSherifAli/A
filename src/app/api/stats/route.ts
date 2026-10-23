import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const coupleSettings = await prisma.coupleSettings.findUnique({
      where: { id: "couple-singleton" },
    });

    const anniversaryDate = coupleSettings?.anniversaryDate ? new Date(coupleSettings.anniversaryDate) : new Date(2026, 8, 5);
    const startMidnight = new Date(anniversaryDate.getUTCFullYear(), anniversaryDate.getUTCMonth(), anniversaryDate.getUTCDate(), 0, 0, 0, 0);
    const nowMidnight = new Date();
    nowMidnight.setHours(0, 0, 0, 0);
    const diffDays = Math.round((nowMidnight.getTime() - startMidnight.getTime()) / (1000 * 60 * 60 * 24));
    const daysTogether = Math.max(1, diffDays + 1);

    const [
      memoriesCount,
      lettersCount,
      placesCount,
      songsCount,
      jokesCount,
      bucketCompletedCount,
      chatMessagesCount,
      reasonsCount,
    ] = await Promise.all([
      prisma.memory.count(),
      prisma.letter.count(),
      prisma.place.count(),
      prisma.song.count(),
      prisma.insideJoke.count(),
      prisma.bucketListItem.count({ where: { isCompleted: true } }),
      prisma.chatMessage.count(),
      prisma.reasonILoveYou.count(),
    ]);

    return NextResponse.json({
      daysTogether,
      memoriesCount,
      lettersCount,
      placesCount,
      songsCount,
      jokesCount,
      bucketCompletedCount,
      chatMessagesCount,
      reasonsCount,
      anniversaryDate,
    });
  } catch (error) {
    console.error("Stats GET error:", error);
    return NextResponse.json({ error: "Failed to fetch relationship statistics" }, { status: 500 });
  }
}
