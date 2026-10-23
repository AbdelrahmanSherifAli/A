import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, verifyVaultPin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { pin, action, title, category, secretText, mediaUrls } = body;

    if (!pin) {
      return NextResponse.json({ error: "Vault PIN is required." }, { status: 400 });
    }

    const isPinValid = await verifyVaultPin(pin);
    if (!isPinValid) {
      return NextResponse.json({ error: "Incorrect security PIN. Access denied." }, { status: 403 });
    }

    if (action === "create") {
      if (!title) {
        return NextResponse.json({ error: "Title is required for vault item" }, { status: 400 });
      }

      const item = await prisma.vaultItem.create({
        data: {
          title,
          category: category || "note",
          secretText: secretText || null,
          mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
        },
      });

      return NextResponse.json({ success: true, item });
    }

    // Default action: unlock and list items
    const items = await prisma.vaultItem.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      unlocked: true,
      items,
    });
  } catch (error) {
    console.error("Vault POST error:", error);
    return NextResponse.json({ error: "Vault operation failed" }, { status: 500 });
  }
}
