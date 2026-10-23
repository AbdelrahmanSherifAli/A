import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const entries = await prisma.weeklyJournalEntry.findMany({
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: [{ year: "desc" }, { weekNumber: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Journal GET error:", error);
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { content, prompt } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Journal content is required" }, { status: 400 });
    }

    const now = new Date();
    // Compute current week number
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);

    const entry = await prisma.weeklyJournalEntry.create({
      data: {
        prompt: prompt || "How was this week for you? What are you grateful for?",
        content: content.trim(),
        weekNumber,
        year: now.getFullYear(),
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Journal POST error:", error);
    return NextResponse.json({ error: "Failed to save journal entry" }, { status: 500 });
  }
}
