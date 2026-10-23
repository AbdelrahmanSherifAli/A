import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.bucketListItem.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Bucket list GET error:", error);
    return NextResponse.json({ error: "Failed to fetch bucket list" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, description, category } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const item = await prisma.bucketListItem.create({
      data: {
        title,
        description: description || null,
        category: category || "adventure",
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Bucket list POST error:", error);
    return NextResponse.json({ error: "Failed to create bucket list item" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, isCompleted, photos } = body;

    if (!id) return NextResponse.json({ error: "Item ID is required" }, { status: 400 });

    const item = await prisma.bucketListItem.update({
      where: { id },
      data: {
        isCompleted: isCompleted ?? true,
        completedAt: isCompleted ? new Date() : null,
        photos: photos ? JSON.stringify(photos) : undefined,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Bucket list PATCH error:", error);
    return NextResponse.json({ error: "Failed to update bucket list item" }, { status: 500 });
  }
}
