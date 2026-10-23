import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${Date.now()}-${sanitizedOriginal}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFilename}`;
    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
