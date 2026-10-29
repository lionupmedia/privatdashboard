import nodemailer from "nodemailer";
import { db } from "./db";
import { allContracts } from "./contracts";

const THRESHOLDS = [7, 30, 90];

export async function runReminders(): Promise<number> {
  const to = process.env.MAIL_TO;
  const host = process.env.SMTP_HOST;
  if (!to || !host) {
    console.warn("[reminders] MAIL_TO/SMTP_HOST nicht gesetzt, übersprungen");
    return 0;
  }

  const due: string[] = [];
  const mark = db.prepare("INSERT OR IGNORE INTO reminders_sent (contract_id, cancel_by, threshold) VALUES (?, ?, ?)");
  const seen = db.prepare("SELECT 1 FROM reminders_sent WHERE contract_id = ? AND cancel_by = ? AND threshold = ?");

  for (const c of allContracts()) {
    if (c.deadline.traffic === "ended") continue;
    // kleinste erreichte Schwelle; größere werden mitmarkiert, damit nicht mehrfach gemailt wird
    const hit = THRESHOLDS.find((t) => c.deadline.daysLeft <= t);
    if (hit === undefined) continue;
    if (seen.get(c.id, c.deadline.cancelBy, hit)) continue;
    due.push(`${c.provider}: kündigen bis ${c.deadline.cancelBy} (noch ${c.deadline.daysLeft} Tage)`);
    for (const t of THRESHOLDS.filter((x) => x >= hit)) mark.run(c.id, c.deadline.cancelBy, t);
  }
  if (due.length === 0) return 0;

  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transport.sendMail({
    from: process.env.MAIL_FROM ?? to,
    to,
    subject: `Kündigungsfristen: ${due.length} Vertrag/Verträge`,
    text: due.join("\n"),
  });
  return due.length;
}
