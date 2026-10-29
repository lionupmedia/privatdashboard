import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadDir } from "@/lib/uploads";

const MAX = 20 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAuthed())) return new NextResponse("Nicht angemeldet", { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  const contractId = Number(form.get("contract_id"));
  if (!(file instanceof File) || !Number.isInteger(contractId)) return new NextResponse("Ungültig", { status: 400 });
  if (file.size > MAX) return new NextResponse("Datei zu groß (max. 20 MB)", { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") return new NextResponse("Nur PDF erlaubt", { status: 415 });
  if (!db.prepare("SELECT 1 FROM contracts WHERE id = ?").get(contractId)) return new NextResponse("Vertrag fehlt", { status: 404 });

  const stored = `${randomUUID()}.pdf`;
  fs.writeFileSync(path.join(uploadDir, stored), buf);
  db.prepare("INSERT INTO documents (contract_id, filename, stored_name) VALUES (?, ?, ?)").run(
    contractId,
    path.basename(file.name).slice(0, 200),
    stored,
  );
  // relative Weiterleitung: req.url enthält hinter dem Reverse Proxy den internen Host
  return new NextResponse(null, { status: 303, headers: { Location: `/contracts/${contractId}` } });
}
