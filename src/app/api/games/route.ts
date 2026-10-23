import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const partner = await prisma.user.findFirst({
      where: { id: { not: user.id } },
    });

    const games = await prisma.gameItem.findMany({
      include: {
        answers: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const sanitizedGames = games.map((game) => {
      const myAnswer = game.answers.find((a) => a.userId === user.id);
      const partnerAnswer = partner ? game.answers.find((a) => a.userId === partner.id) : null;
      const bothAnswered = Boolean(myAnswer && partnerAnswer);

      let optionsList: string[] = [];
      if (game.options) {
        try {
          optionsList = JSON.parse(game.options);
        } catch {}
      }

      return {
        id: game.id,
        type: game.type,
        prompt: game.prompt,
        optionA: game.optionA,
        optionB: game.optionB,
        options: optionsList,
        category: game.category,
        myChoice: myAnswer?.selectedOption || null,
        myGuessedPartner: myAnswer?.guessedPartner || null,
        partnerAnswered: Boolean(partnerAnswer),
        bothAnswered,
        partnerChoice: bothAnswered ? partnerAnswer?.selectedOption : null,
        partnerName: partner?.name || "Partner",
        isMatch: bothAnswered && myAnswer?.selectedOption === partnerAnswer?.selectedOption,
        guessedCorrectly:
          bothAnswered &&
          Boolean(myAnswer?.guessedPartner && myAnswer.guessedPartner === partnerAnswer?.selectedOption),
      };
    });

    return NextResponse.json({
      thisOrThat: sanitizedGames.filter((g) => g.type === "this_or_that"),
      guessMyAnswer: sanitizedGames.filter((g) => g.type === "guess_my_answer"),
    });
  } catch (error) {
    console.error("Games GET error:", error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { gameItemId, selectedOption, guessedPartner } = body;

    if (!gameItemId || !selectedOption) {
      return NextResponse.json({ error: "Game ID and selected option are required" }, { status: 400 });
    }

    const answer = await prisma.gameAnswer.upsert({
      where: {
        gameItemId_userId: {
          gameItemId,
          userId: user.id,
        },
      },
      update: {
        selectedOption,
        guessedPartner: guessedPartner || null,
      },
      create: {
        gameItemId,
        userId: user.id,
        selectedOption,
        guessedPartner: guessedPartner || null,
      },
    });

    return NextResponse.json({ success: true, answer });
  } catch (error) {
    console.error("Games POST error:", error);
    return NextResponse.json({ error: "Failed to save game answer" }, { status: 500 });
  }
}
