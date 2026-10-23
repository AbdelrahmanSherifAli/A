import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reasons = await prisma.reasonILoveYou.findMany({
      include: {
        author: { select: { id: true, name: true, nickname: true, avatarUrl: true } },
      },
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({ reasons });
  } catch (error) {
    console.error("Reasons GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reasons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Reason text is required" }, { status: 400 });
    }

    const count = await prisma.reasonILoveYou.count();

    const created = await prisma.reasonILoveYou.create({
      data: {
        orderIndex: count + 1,
        reason: reason.trim(),
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, name: true, nickname: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ success: true, reason: created });
  } catch (error) {
    console.error("Reasons POST error:", error);
    return NextResponse.json({ error: "Failed to add reason" }, { status: 500 });
  }
}
