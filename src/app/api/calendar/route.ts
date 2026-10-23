import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const calendarEvents = await prisma.calendarEvent.findMany({
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { startDate: "asc" },
    });

    const importantDates = await prisma.importantDate.findMany({
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ calendarEvents, importantDates });
  } catch (error) {
    console.error("Calendar GET error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, startDate, endDate, category, notes, location } = body;

    if (!title || !startDate) {
      return NextResponse.json({ error: "Title and start date are required." }, { status: 400 });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        category: category || "date_night",
        notes: notes || null,
        location: location || null,
        createdById: user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Calendar POST error:", error);
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 });
  }
}
