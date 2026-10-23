import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // 1. Fetch personal letters
    const rawLetters = await prisma.letter.findMany({
      include: {
        author: { select: { id: true, name: true, nickname: true, avatarUrl: true } },
        recipient: { select: { id: true, name: true, nickname: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Sanitize: do not send content for locked letters where unlock date is in the future
    const letters = rawLetters.map((l) => {
      const isLocked = l.isLocked || (l.unlockDate && new Date(l.unlockDate) > now);
      if (isLocked) {
        return {
          ...l,
          content: "[LOCKED_CONTENT_UNTIL_UNLOCK_DATE]",
          isCurrentlyLocked: true,
        };
      }
      return {
        ...l,
        isCurrentlyLocked: false,
      };
    });

    // 2. Fetch Open When envelopes
    const rawEnvelopes = await prisma.openWhenEnvelope.findMany({
      orderBy: { createdAt: "asc" },
    });

    const envelopes = rawEnvelopes.map((env) => {
      const isDateLocked = env.unlockDate && new Date(env.unlockDate) > now;
      const isLocked = env.isLocked || isDateLocked;

      if (isLocked && !env.isOpened) {
        return {
          ...env,
          content: "[LOCKED_ENVELOPE_CONTENT]",
          isCurrentlyLocked: true,
        };
      }
      return {
        ...env,
        isCurrentlyLocked: false,
      };
    });

    return NextResponse.json({ letters, envelopes });
  } catch (error) {
    console.error("Letters GET error:", error);
    return NextResponse.json({ error: "Failed to fetch letters" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body;

    if (type === "envelope") {
      const { title, prompt, content, waxColor, sealSymbol, unlockDate } = body;
      if (!title || !content) {
        return NextResponse.json({ error: "Title and letter content are required." }, { status: 400 });
      }

      const isLocked = unlockDate ? new Date(unlockDate) > new Date() : false;

      const envelope = await prisma.openWhenEnvelope.create({
        data: {
          title,
          prompt: prompt || title,
          content,
          waxColor: waxColor || "gold",
          sealSymbol: sealSymbol || "heart",
          unlockDate: unlockDate ? new Date(unlockDate) : null,
          isLocked,
        },
      });

      return NextResponse.json({ success: true, envelope });
    }

    // Standard Digital Letter
    const { title, content, unlockDate, unlockCondition } = body;
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    // Find the partner to set as recipient
    const partner = await prisma.user.findFirst({
      where: { id: { not: user.id } },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner account not found." }, { status: 400 });
    }

    const isLocked = unlockDate ? new Date(unlockDate) > new Date() : false;

    const letter = await prisma.letter.create({
      data: {
        title,
        content,
        authorId: user.id,
        recipientId: partner.id,
        unlockDate: unlockDate ? new Date(unlockDate) : null,
        unlockCondition: unlockCondition || null,
        isLocked,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ success: true, letter });
  } catch (error) {
    console.error("Letters POST error:", error);
    return NextResponse.json({ error: "Failed to send letter" }, { status: 500 });
  }
}
