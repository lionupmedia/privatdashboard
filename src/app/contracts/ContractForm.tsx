import Link from "next/link";
import { saveContract } from "@/app/actions";
import type { Contract } from "@/lib/db";
import { INTERVALS } from "@/lib/status";
import { AlertIcon } from "@/components/icons";

const CATEGORIES = ["Versicherung", "Strom & Gas", "Internet & Handy", "Streaming & Abos", "Miete & Wohnen", "Auto", "Bank & Finanzen", "Sonstiges"];

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-5 border-t border-line px-5 py-6 first:border-t-0 sm:grid-cols-3 sm:px-6">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden="true">
        <h2 className="font-semibold">{title}</h2>
        {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
      </div>
      <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function ContractForm({ c, error }: { c?: Contract; error?: boolean }) {
  const intervals = INTERVALS.some(([m]) => m === c?.interval_months) || !c ? INTERVALS : [...INTERVALS, [c.interval_months, `alle ${c.interval_months} Monate`] as [number, string]];

  return (
    <form action={saveContract} className="card">
      {c && <input type="hidden" name="id" value={c.id} />}

      {error && (
        <p role="alert" className="badge badge-red m-5 !whitespace-normal !rounded-lg !px-3 !py-2 !text-sm">
          <AlertIcon width={16} height={16} className="shrink-0" />
          Bitte Anbieter und Vertragsbeginn angeben.
        </p>
      )}

      <Section title="Vertrag" desc="Wer ist der Vertragspartner?">
        <div className="sm:col-span-2">
          <label htmlFor="provider" className="label">Anbieter</label>
          <input id="provider" name="provider" required defaultValue={c?.provider} placeholder="z. B. Telekom" className="input" />
        </div>
        <div>
          <label htmlFor="category" className="label">Kategorie</label>
          <input id="category" name="category" list="categories" defaultValue={c?.category} placeholder="Kategorie wählen oder tippen" className="input" />
          <datalist id="categories">{CATEGORIES.map((x) => <option key={x} value={x} />)}</datalist>
        </div>
        <div>
          <label htmlFor="customer_no" className="label">Kundennummer</label>
          <input id="customer_no" name="customer_no" defaultValue={c?.customer_no} className="input" />
        </div>
      </Section>

      <Section title="Kosten" desc="Was kostet der Vertrag?">
        <div>
          <label htmlFor="cost" className="label">Betrag (€)</label>
          <input id="cost" name="cost" inputMode="decimal" defaultValue={c ? (c.cost_cents / 100).toFixed(2).replace(".", ",") : ""} placeholder="29,99" className="input" />
        </div>
        <div>
          <label htmlFor="interval_months" className="label">Zahlungsintervall</label>
          <select id="interval_months" name="interval_months" defaultValue={c?.interval_months ?? 1} className="input">
            {intervals.map(([m, l]) => <option key={m} value={m}>{l}</option>)}
          </select>
        </div>
      </Section>

      <Section title="Laufzeit & Kündigung" desc="Daraus berechnet das Dashboard das späteste Kündigungsdatum.">
        <div className="sm:col-span-2">
          <label htmlFor="start_date" className="label">Vertragsbeginn</label>
          <input id="start_date" name="start_date" type="date" required defaultValue={c?.start_date} className="input sm:max-w-[16rem]" />
        </div>
        <div>
          <label htmlFor="min_term_months" className="label">Mindestlaufzeit (Monate)</label>
          <input id="min_term_months" name="min_term_months" type="number" min={0} defaultValue={c?.min_term_months ?? 12} className="input" />
        </div>
        <div>
          <label htmlFor="notice_days" className="label">Kündigungsfrist (Tage)</label>
          <input id="notice_days" name="notice_days" type="number" min={0} defaultValue={c?.notice_days ?? 30} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="renewal_months" className="label">Automatische Verlängerung (Monate)</label>
          <input id="renewal_months" name="renewal_months" type="number" min={0} defaultValue={c?.renewal_months ?? 12} className="input sm:max-w-[16rem]" />
          <p className="hint">0 = Vertrag endet nach der Mindestlaufzeit ohne Verlängerung.</p>
        </div>
      </Section>

      <Section title="Notizen">
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="label">Anmerkungen</label>
          <textarea id="notes" name="notes" rows={4} defaultValue={c?.notes} className="input" />
        </div>
      </Section>

      <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Link href="/" className="btn btn-secondary">Abbrechen</Link>
        <button className="btn btn-primary">Speichern</button>
      </div>
    </form>
  );
}
