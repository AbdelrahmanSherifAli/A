import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jokes = await prisma.insideJoke.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jokes });
  } catch (error) {
    console.error("Jokes GET error:", error);
    return NextResponse.json({ error: "Failed to fetch jokes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, punchlineOrContext, photoUrl } = body;

    if (!title || !punchlineOrContext) {
      return NextResponse.json({ error: "Title and context are required" }, { status: 400 });
    }

    const joke = await prisma.insideJoke.create({
      data: {
        title,
        punchlineOrContext,
        photoUrl: photoUrl || null,
        laughCount: 1,
      },
    });

    return NextResponse.json({ success: true, joke });
  } catch (error) {
    console.error("Jokes POST error:", error);
    return NextResponse.json({ error: "Failed to add joke" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: "Joke ID is required" }, { status: 400 });

    const joke = await prisma.insideJoke.update({
      where: { id },
      data: {
        laughCount: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, joke });
  } catch (error) {
    console.error("Jokes PATCH error:", error);
    return NextResponse.json({ error: "Failed to update laugh count" }, { status: 500 });
  }
}
