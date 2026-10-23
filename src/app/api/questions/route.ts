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

    const questions = await prisma.question.findMany({
      include: {
        answers: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: [{ isToday: "desc" }, { createdAt: "desc" }],
    });

    // Sanitize answers: do not reveal partner answer unless user has also answered!
    const sanitizedQuestions = questions.map((q) => {
      const myAnswer = q.answers.find((a) => a.userId === user.id);
      const partnerAnswer = partner ? q.answers.find((a) => a.userId === partner.id) : null;

      const bothAnswered = Boolean(myAnswer && partnerAnswer);

      return {
        id: q.id,
        prompt: q.prompt,
        category: q.category,
        isToday: q.isToday,
        createdAt: q.createdAt,
        myAnswer: myAnswer ? myAnswer.answerText : null,
        myAnsweredAt: myAnswer ? myAnswer.createdAt : null,
        partnerAnswered: Boolean(partnerAnswer),
        partnerName: partner?.name || "Partner",
        bothAnswered,
        partnerAnswer: bothAnswered
          ? partnerAnswer?.answerText
          : partnerAnswer
          ? "[SEALED_UNTIL_YOU_ANSWER]"
          : null,
      };
    });

    const todayQuestion = sanitizedQuestions.find((q) => q.isToday) || sanitizedQuestions[0] || null;

    return NextResponse.json({
      todayQuestion,
      pastQuestions: sanitizedQuestions.filter((q) => q.id !== todayQuestion?.id),
    });
  } catch (error) {
    console.error("Questions GET error:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { questionId, answerText } = body;

    if (!questionId || !answerText || !answerText.trim()) {
      return NextResponse.json({ error: "Question ID and answer text are required" }, { status: 400 });
    }

    const answer = await prisma.questionAnswer.upsert({
      where: {
        questionId_userId: {
          questionId,
          userId: user.id,
        },
      },
      update: {
        answerText: answerText.trim(),
      },
      create: {
        questionId,
        userId: user.id,
        answerText: answerText.trim(),
      },
    });

    return NextResponse.json({ success: true, answer });
  } catch (error) {
    console.error("Questions POST error:", error);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
