import { NextResponse } from "next/server";
import { getCurrentUser, getPartnerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const partner = await getPartnerUser(user.id);
    const coupleSettings = await prisma.coupleSettings.findUnique({
      where: { id: "couple-singleton" },
      select: {
        partner1Name: true,
        partner2Name: true,
        anniversaryDate: true,
        relationshipQuote: true,
        coverPhotoUrl: true,
        spotifyPlaylistUrl: true,
      },
    });

    return NextResponse.json({
      authenticated: true,
      user,
      partner,
      coupleSettings,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
