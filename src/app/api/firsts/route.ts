import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const firsts = await prisma.firstTimeMoment.findMany({
      orderBy: { momentDate: "asc" },
    });

    return NextResponse.json({ firsts });
  } catch (error) {
    console.error("Firsts GET error:", error);
    return NextResponse.json({ error: "Failed to fetch firsts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { category, title, momentDate, description, photoUrl } = body;

    if (!category || !title || !description) {
      return NextResponse.json({ error: "Category, title, and description are required" }, { status: 400 });
    }

    const first = await prisma.firstTimeMoment.create({
      data: {
        category,
        title,
        momentDate: momentDate ? new Date(momentDate) : null,
        description,
        photoUrl: photoUrl || null,
      },
    });

    return NextResponse.json({ success: true, first });
  } catch (error) {
    console.error("Firsts POST error:", error);
    return NextResponse.json({ error: "Failed to record first moment" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, isHappened, momentDate, description } = body;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updated = await prisma.firstTimeMoment.update({
      where: { id },
      data: {
        isHappened: isHappened !== undefined ? isHappened : true,
        momentDate: momentDate ? new Date(momentDate) : new Date(),
        description: description || undefined,
      },
    });

    return NextResponse.json({ success: true, first: updated });
  } catch (error) {
    console.error("Firsts PATCH error:", error);
    return NextResponse.json({ error: "Failed to update first moment" }, { status: 500 });
  }
}

