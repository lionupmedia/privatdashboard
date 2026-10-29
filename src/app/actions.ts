"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { endSession, requireSession } from "@/lib/auth";

const int = (v: FormDataEntryValue | null, d = 0) => (Number.isFinite(Number(v)) && v !== "" ? Math.max(0, Math.trunc(Number(v))) : d);

export async function saveContract(form: FormData) {
  await requireSession();
  const id = int(form.get("id"));
  const v = {
    provider: String(form.get("provider") ?? "").trim(),
    category: String(form.get("category") ?? "Sonstiges").trim() || "Sonstiges",
    cost_cents: Math.round(Number(String(form.get("cost") ?? "0").replace(",", ".")) * 100) || 0,
    interval_months: Math.max(1, int(form.get("interval_months"), 1)),
    start_date: String(form.get("start_date") ?? ""),
    min_term_months: int(form.get("min_term_months"), 12),
    renewal_months: int(form.get("renewal_months"), 12),
    notice_days: int(form.get("notice_days"), 30),
    customer_no: String(form.get("customer_no") ?? ""),
    notes: String(form.get("notes") ?? ""),
  };
  if (!v.provider || !/^\d{4}-\d{2}-\d{2}$/.test(v.start_date)) redirect(id ? `/contracts/${id}?error=1` : "/contracts/new?error=1");

  if (id) {
    db.prepare(
      `UPDATE contracts SET provider=@provider, category=@category, cost_cents=@cost_cents, interval_months=@interval_months,
       start_date=@start_date, min_term_months=@min_term_months, renewal_months=@renewal_months, notice_days=@notice_days,
       customer_no=@customer_no, notes=@notes WHERE id=@id`,
    ).run({ ...v, id });
  } else {
    db.prepare(
      `INSERT INTO contracts (provider, category, cost_cents, interval_months, start_date, min_term_months, renewal_months, notice_days, customer_no, notes)
       VALUES (@provider, @category, @cost_cents, @interval_months, @start_date, @min_term_months, @renewal_months, @notice_days, @customer_no, @notes)`,
    ).run(v);
  }
  revalidatePath("/");
  redirect("/");
}

export async function deleteContract(form: FormData) {
  await requireSession();
  db.prepare("DELETE FROM contracts WHERE id = ?").run(int(form.get("id")));
  revalidatePath("/");
  redirect("/");
}

export async function logout() {
  await endSession();
  redirect("/login");
}
