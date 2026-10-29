import { db, type Contract } from "./db";
import { nextDeadline, fmt, type DeadlineInfo } from "./deadline";

export type Row = Contract & { deadline: DeadlineInfo };

export function today(): string {
  return fmt(new Date());
}

export function allContracts(): Row[] {
  const rows = db.prepare("SELECT * FROM contracts ORDER BY provider").all() as Contract[];
  const t = today();
  return rows
    .map((c) => ({
      ...c,
      deadline: nextDeadline(
        { startDate: c.start_date, minTermMonths: c.min_term_months, renewalMonths: c.renewal_months, noticeDays: c.notice_days },
        t,
      ),
    }))
    .sort((a, b) => a.deadline.daysLeft - b.deadline.daysLeft);
}

export const eur = (cents: number) => (cents / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
