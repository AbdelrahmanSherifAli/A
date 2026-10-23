import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const plans = await prisma.planItem.findMany({
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: [{ status: "asc" }, { targetDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Plans GET error:", error);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, description, targetDate, location, category } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required for a plan" }, { status: 400 });
    }

    const plan = await prisma.planItem.create({
      data: {
        title: title.trim(),
        description: description || null,
        targetDate: targetDate ? new Date(targetDate) : null,
        location: location || null,
        category: category || "date",
        status: "planned",
        createdById: user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Plans POST error:", error);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, status, convertToMemory, memoryPhotos, memoryNotes } = body;

    if (!id) return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });

    const plan = await prisma.planItem.findUnique({ where: { id } });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    let createdMemoryId: string | null = null;

    // Plan -> Memory Loop
    if (convertToMemory && status === "completed") {
      const memory = await prisma.memory.create({
        data: {
          title: plan.title,
          description: memoryNotes || plan.description || "We fulfilled this plan together! ❤️",
          memoryDate: new Date(),
          location: plan.location,
          mood: "joyful",
          tags: `plan, ${plan.category}`,
          authorId: user.id,
          photos: memoryPhotos ? JSON.stringify(memoryPhotos) : null,
        },
      });
      createdMemoryId = memory.id;

      // Add to timeline
      await prisma.timelineEvent.create({
        data: {
          title: `Completed: ${plan.title}`,
          description: memoryNotes || plan.description || "A planned adventure fulfilled.",
          eventDate: new Date(),
          year: new Date().getFullYear(),
          category: plan.category === "trip" ? "trip" : "milestone",
          location: plan.location,
          photos: memoryPhotos ? JSON.stringify(memoryPhotos) : null,
          authorId: user.id,
          memoryId: memory.id,
        },
      });
    }

    const updatedPlan = await prisma.planItem.update({
      where: { id },
      data: {
        status: status || "completed",
        completedAt: status === "completed" ? new Date() : null,
        completedToMemoryId: createdMemoryId || undefined,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
      memoryId: createdMemoryId,
    });
  } catch (error) {
    console.error("Plans PATCH error:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });

    await prisma.planItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Plans DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}

