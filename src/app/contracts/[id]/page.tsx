import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db, type Contract, type Doc } from "@/lib/db";
import { nextDeadline } from "@/lib/deadline";
import { today, eur } from "@/lib/contracts";
import { monthlyCents } from "@/lib/db";
import { dateDe, daysText } from "@/lib/status";
import { deleteContract } from "@/app/actions";
import { AppHeader } from "@/components/AppHeader";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeftIcon, FileIcon, UploadIcon } from "@/components/icons";
import { ContractForm } from "../ContractForm";

export default async function EditContract({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  await requireSession();
  const { id } = await params;
  const { error } = await searchParams;
  const c = db.prepare("SELECT * FROM contracts WHERE id = ?").get(Number(id)) as Contract | undefined;
  if (!c) notFound();
  const docs = db.prepare("SELECT * FROM documents WHERE contract_id = ?").all(c.id) as Doc[];
  const d = nextDeadline({ startDate: c.start_date, minTermMonths: c.min_term_months, renewalMonths: c.renewal_months, noticeDays: c.notice_days }, today());

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeftIcon width={16} height={16} />Übersicht</Link>
        <div className="mb-6 mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{c.provider}</h1>
          <StatusBadge traffic={d.traffic} />
        </div>

        <section aria-label="Fristen" className="card mb-6 grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-5">
            <div className="eyebrow">Kündigen bis</div>
            <div className="mt-1 text-xl font-semibold tabular-nums">{d.traffic === "ended" ? "–" : dateDe(d.cancelBy)}</div>
            {d.traffic !== "ended" && <div className="text-sm text-muted">{daysText(d.daysLeft)}</div>}
          </div>
          <div className="p-5">
            <div className="eyebrow">Laufzeitende</div>
            <div className="mt-1 text-xl font-semibold tabular-nums">{dateDe(d.termEnd)}</div>
          </div>
          <div className="p-5">
            <div className="eyebrow">Kosten pro Monat</div>
            <div className="mt-1 text-xl font-semibold tabular-nums">{eur(monthlyCents(c))}</div>
          </div>
        </section>

        <ContractForm c={c} error={!!error} />

        <section className="card mt-6" aria-labelledby="docs">
          <div className="border-b border-line px-5 py-4 sm:px-6">
            <h2 id="docs" className="font-semibold">Dokumente</h2>
            <p className="text-sm text-muted">Vertrag, Rechnungen, Bestätigungen (PDF, max. 20 MB)</p>
          </div>
          {docs.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted sm:px-6">Noch keine Dokumente hochgeladen.</p>
          ) : (
            <ul className="divide-y divide-line">
              {docs.map((x) => (
                <li key={x.id}>
                  <a href={`/files/${x.id}`} target="_blank" rel="noopener" className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-200 hover:bg-subtle sm:px-6">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-subtle text-muted"><FileIcon /></span>
                    <span className="min-w-0 flex-1 truncate font-medium">{x.filename}</span>
                    <span className="text-sm text-accent">Öffnen</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          <form action="/files/upload" method="post" encType="multipart/form-data" className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:px-6">
            <input type="hidden" name="contract_id" value={c.id} />
            <label htmlFor="file" className="sr-only">PDF auswählen</label>
            <input id="file" type="file" name="file" accept="application/pdf" required
              className="input flex-1 cursor-pointer !p-0 text-muted file:mr-3 file:h-full file:cursor-pointer file:border-0 file:bg-subtle file:px-4 file:text-sm file:font-medium file:text-fg" />
            <button className="btn btn-secondary"><UploadIcon width={16} height={16} />Hochladen</button>
          </form>
        </section>

        <section className="card mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6" aria-labelledby="danger">
          <div>
            <h2 id="danger" className="font-semibold">Vertrag löschen</h2>
            <p className="text-sm text-muted">Entfernt den Vertrag und seine Dokumente dauerhaft.</p>
          </div>
          <ConfirmDelete action={deleteContract} id={c.id} name={c.provider} />
        </section>
      </main>
    </>
  );
}
