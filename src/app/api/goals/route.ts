import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const goals = await prisma.coupleGoal.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Goals GET error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, description, targetDate, progressPercent, status, category } = body;

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const goal = await prisma.coupleGoal.create({
      data: {
        title,
        description: description || null,
        targetDate: targetDate ? new Date(targetDate) : null,
        progressPercent: progressPercent || 0,
        status: status || "in_progress",
        category: category || "shared_dream",
      },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error("Goals POST error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, progressPercent, status } = body;

    if (!id) return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });

    const goal = await prisma.coupleGoal.update({
      where: { id },
      data: {
        progressPercent: progressPercent !== undefined ? progressPercent : undefined,
        status: status || undefined,
      },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error("Goals PATCH error:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}
