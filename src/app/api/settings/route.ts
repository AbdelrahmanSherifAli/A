import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const settings = await prisma.coupleSettings.findUnique({
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

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      partner1Name,
      partner2Name,
      anniversaryDate,
      relationshipQuote,
      newVaultPin,
      coverPhotoUrl,
      spotifyPlaylistUrl,
      partner1SpotifyUrl,
      partner2SpotifyUrl,
    } = body;

    const dataToUpdate: any = {};
    if (partner1Name) dataToUpdate.partner1Name = partner1Name;
    if (partner2Name) dataToUpdate.partner2Name = partner2Name;
    if (anniversaryDate) dataToUpdate.anniversaryDate = new Date(anniversaryDate);
    if (relationshipQuote) dataToUpdate.relationshipQuote = relationshipQuote;
    if (coverPhotoUrl) dataToUpdate.coverPhotoUrl = coverPhotoUrl;
    if (spotifyPlaylistUrl !== undefined) dataToUpdate.spotifyPlaylistUrl = spotifyPlaylistUrl;

    if (newVaultPin && newVaultPin.length >= 4) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.vaultPinHash = await bcrypt.hash(newVaultPin, salt);
    }

    const updated = await prisma.coupleSettings.update({
      where: { id: "couple-singleton" },
      data: dataToUpdate,
    });

    // Update partner Spotify profiles if provided
    if (partner1SpotifyUrl !== undefined) {
      await prisma.user.updateMany({
        where: { role: "partner1" },
        data: { spotifyProfileUrl: partner1SpotifyUrl },
      });
    }
    if (partner2SpotifyUrl !== undefined) {
      await prisma.user.updateMany({
        where: { role: "partner2" },
        data: { spotifyProfileUrl: partner2SpotifyUrl },
      });
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
