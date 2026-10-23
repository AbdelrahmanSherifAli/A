import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const identity = await prisma.coupleIdentity.findUnique({
      where: { id: "identity-singleton" },
    });

    return NextResponse.json({ identity });
  } catch (error) {
    console.error("Identity GET error:", error);
    return NextResponse.json({ error: "Failed to fetch couple identity" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      ourSong,
      ourNickname,
      ourRestaurant,
      ourEmoji,
      ourFavoriteMovie,
      ourCozyPlace,
      ourCoffeeOrder,
    } = body;

    const updated = await prisma.coupleIdentity.upsert({
      where: { id: "identity-singleton" },
      update: {
        ourSong,
        ourNickname,
        ourRestaurant,
        ourEmoji,
        ourFavoriteMovie,
        ourCozyPlace,
        ourCoffeeOrder,
      },
      create: {
        id: "identity-singleton",
        ourSong,
        ourNickname,
        ourRestaurant,
        ourEmoji,
        ourFavoriteMovie,
        ourCozyPlace,
        ourCoffeeOrder,
      },
    });

    return NextResponse.json({ success: true, identity: updated });
  } catch (error) {
    console.error("Identity POST error:", error);
    return NextResponse.json({ error: "Failed to update couple identity" }, { status: 500 });
  }
}
