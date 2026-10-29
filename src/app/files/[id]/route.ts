import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { db, type Doc } from "@/lib/db";
import { uploadDir } from "@/lib/uploads";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return new NextResponse("Nicht angemeldet", { status: 401 });
  const { id } = await params;
  const d = db.prepare("SELECT * FROM documents WHERE id = ?").get(Number(id)) as Doc | undefined;
  if (!d) return new NextResponse("Nicht gefunden", { status: 404 });
  const data = fs.readFileSync(path.join(uploadDir, path.basename(d.stored_name)));
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(d.filename)}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
