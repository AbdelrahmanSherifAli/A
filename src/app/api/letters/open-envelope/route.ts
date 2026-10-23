import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { envelopeId } = await request.json();
    if (!envelopeId) {
      return NextResponse.json({ error: "Envelope ID is required" }, { status: 400 });
    }

    const envelope = await prisma.openWhenEnvelope.findUnique({
      where: { id: envelopeId },
    });

    if (!envelope) {
      return NextResponse.json({ error: "Envelope not found" }, { status: 404 });
    }

    // Backend security check: if date is locked and in future, reject!
    if (envelope.unlockDate && new Date(envelope.unlockDate) > new Date()) {
      return NextResponse.json(
        {
          error: "This envelope is securely sealed until " + new Date(envelope.unlockDate).toLocaleDateString(),
          isDateLocked: true,
        },
        { status: 403 }
      );
    }

    // Mark as opened
    const updated = await prisma.openWhenEnvelope.update({
      where: { id: envelopeId },
      data: {
        isOpened: true,
        isLocked: false,
        openedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      envelope: updated,
    });
  } catch (error) {
    console.error("Open envelope error:", error);
    return NextResponse.json({ error: "Failed to open envelope" }, { status: 500 });
  }
}
