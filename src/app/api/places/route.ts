import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const places = await prisma.place.findMany({
      orderBy: { visitedDate: "desc" },
    });

    return NextResponse.json({ places });
  } catch (error) {
    console.error("Places GET error:", error);
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, city, country, visitedDate, description, photos, rating, latitude, longitude } = body;

    if (!name) {
      return NextResponse.json({ error: "Place name is required." }, { status: 400 });
    }

    const place = await prisma.place.create({
      data: {
        name,
        city: city || null,
        country: country || null,
        visitedDate: visitedDate ? new Date(visitedDate) : null,
        description: description || null,
        photos: photos ? JSON.stringify(photos) : null,
        rating: rating || 5,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    return NextResponse.json({ success: true, place });
  } catch (error) {
    console.error("Places POST error:", error);
    return NextResponse.json({ error: "Failed to add place" }, { status: 500 });
  }
}
