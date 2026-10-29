import { saveContract } from "@/app/actions";
import type { Contract } from "@/lib/db";

const inp = "rounded border p-2 w-full";

export function ContractForm({ c }: { c?: Contract }) {
  return (
    <form action={saveContract} className="grid max-w-xl gap-3">
      {c && <input type="hidden" name="id" value={c.id} />}
      <label>Anbieter<input name="provider" required defaultValue={c?.provider} className={inp} /></label>
      <label>Kategorie<input name="category" defaultValue={c?.category} placeholder="Versicherung, Strom, Handy…" className={inp} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label>Kosten (€)<input name="cost" defaultValue={c ? (c.cost_cents / 100).toFixed(2) : ""} className={inp} /></label>
        <label>Zahlungsintervall (Monate)<input name="interval_months" type="number" min={1} defaultValue={c?.interval_months ?? 1} className={inp} /></label>
      </div>
      <label>Vertragsbeginn<input name="start_date" type="date" required defaultValue={c?.start_date} className={inp} /></label>
      <div className="grid grid-cols-3 gap-3">
        <label>Mindestlaufzeit (Mon.)<input name="min_term_months" type="number" min={0} defaultValue={c?.min_term_months ?? 12} className={inp} /></label>
        <label>Verlängerung (Mon., 0=keine)<input name="renewal_months" type="number" min={0} defaultValue={c?.renewal_months ?? 12} className={inp} /></label>
        <label>Kündigungsfrist (Tage)<input name="notice_days" type="number" min={0} defaultValue={c?.notice_days ?? 30} className={inp} /></label>
      </div>
      <label>Kundennummer<input name="customer_no" defaultValue={c?.customer_no} className={inp} /></label>
      <label>Notizen<textarea name="notes" defaultValue={c?.notes} rows={3} className={inp} /></label>
      <button className="rounded bg-black p-2 text-white">Speichern</button>
    </form>
  );
}
