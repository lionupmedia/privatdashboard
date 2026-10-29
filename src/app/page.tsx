import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { allContracts, eur } from "@/lib/contracts";
import { monthlyCents } from "@/lib/db";
import { daysText, dateDe } from "@/lib/status";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { BellIcon, CalendarIcon, CheckIcon, ChevronRightIcon, FileIcon, PlusIcon, WalletIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

function Kpi({ label, value, sub, icon, tone }: { label: string; value: string; sub?: string; icon: React.ReactNode; tone?: "bad" }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow">{label}</span>
        <span className={`hidden h-8 w-8 sm:grid place-items-center rounded-lg ${tone === "bad" ? "badge-red" : "bg-subtle text-muted"}`}>{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:mt-3 sm:text-3xl">{value}</div>
      {sub && <div className="mt-1 text-sm text-muted">{sub}</div>}
    </div>
  );
}

export default async function Home() {
  await requireSession();
  const rows = allContracts();
  const active = rows.filter((r) => r.deadline.traffic !== "ended");
  const monthly = active.reduce((s, r) => s + monthlyCents(r), 0);
  const upcoming = active.filter((r) => r.deadline.daysLeft <= 90);
  const urgent = upcoming.filter((r) => r.deadline.traffic === "red").length;

  const byCat = new Map<string, number>();
  for (const r of active) byCat.set(r.category, (byCat.get(r.category) ?? 0) + monthlyCents(r));
  const cats = [...byCat].sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(1, ...cats.map((c) => c[1]));

  const stand = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Übersicht</h1>
          <p className="mt-1 text-muted">Stand: {stand}</p>
        </div>

        {rows.length === 0 ? (
          <div className="card grid place-items-center px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-subtle text-muted"><FileIcon width={24} height={24} /></span>
            <h2 className="mt-4 text-lg font-semibold">Noch keine Verträge</h2>
            <p className="mt-1 max-w-sm text-muted">Lege deinen ersten Vertrag an. Das Dashboard berechnet die Kündigungsfrist automatisch und erinnert dich rechtzeitig.</p>
            <Link href="/contracts/new" className="btn btn-primary mt-6"><PlusIcon width={16} height={16} />Ersten Vertrag anlegen</Link>
          </div>
        ) : (
          <>
            <section aria-label="Kennzahlen" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <Kpi label="Fixkosten / Monat" value={eur(monthly)} icon={<WalletIcon />} />
              <Kpi label="Fixkosten / Jahr" value={eur(monthly * 12)} icon={<CalendarIcon />} />
              <Kpi label="Aktive Verträge" value={String(active.length)} sub={`${rows.length - active.length} beendet`} icon={<FileIcon />} />
              <Kpi label="Dringende Fristen" value={String(urgent)} sub={`${upcoming.length} in den nächsten 90 Tagen`} icon={<BellIcon />} tone={urgent > 0 ? "bad" : undefined} />
            </section>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <section className="card lg:col-span-2" aria-labelledby="fristen">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <h2 id="fristen" className="font-semibold">Anstehende Fristen</h2>
                  <span className="text-sm text-muted">nächste 90 Tage</span>
                </div>
                {upcoming.length === 0 ? (
                  <div className="flex items-center gap-3 px-5 py-8 text-muted">
                    <span className="badge-green grid h-9 w-9 place-items-center rounded-lg border"><CheckIcon /></span>
                    Keine Kündigungsfristen in den nächsten 90 Tagen.
                  </div>
                ) : (
                  <ul className="divide-y divide-line">
                    {upcoming.map((r) => (
                      <li key={r.id}>
                        <Link href={`/contracts/${r.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-subtle">
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{r.provider}</div>
                            <div className="text-sm text-muted">Kündigen bis {dateDe(r.deadline.cancelBy)} · {daysText(r.deadline.daysLeft)}</div>
                          </div>
                          <StatusBadge traffic={r.deadline.traffic} />
                          <ChevronRightIcon className="hidden text-muted sm:block" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="card" aria-labelledby="kat">
                <div className="border-b border-line px-5 py-4">
                  <h2 id="kat" className="font-semibold">Kosten nach Kategorie</h2>
                  <p className="text-sm text-muted">pro Monat</p>
                </div>
                <ul className="space-y-4 p-5">
                  {cats.map(([cat, c]) => (
                    <li key={cat}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span>{cat}</span>
                        <span className="font-medium tabular-nums">{eur(c)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-subtle" role="img" aria-label={`${cat}: ${Math.round((c / monthly) * 100)} Prozent`}>
                        <div className="h-full rounded-full bg-accent" style={{ width: `${(c / maxCat) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                  {cats.length === 0 && <li className="text-sm text-muted">Keine aktiven Verträge.</li>}
                </ul>
              </section>
            </div>

            <section className="mt-6" aria-labelledby="alle">
              <h2 id="alle" className="mb-3 font-semibold">Alle Verträge</h2>

              {/* Mobil: Karten */}
              <ul className="space-y-3 md:hidden">
                {rows.map((r) => (
                  <li key={r.id}>
                    <Link href={`/contracts/${r.id}`} className="card block p-4 transition-colors duration-200 hover:bg-subtle">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium">{r.provider}</div>
                          <div className="text-sm text-muted">{r.category}</div>
                        </div>
                        <StatusBadge traffic={r.deadline.traffic} />
                      </div>
                      <div className="mt-3 flex justify-between text-sm">
                        <span className="text-muted">{r.deadline.traffic === "ended" ? "Beendet" : `Kündigen bis ${dateDe(r.deadline.cancelBy)}`}</span>
                        <span className="font-medium tabular-nums">{eur(monthlyCents(r))}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Desktop: Tabelle */}
              <div className="card hidden overflow-hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-subtle/60 text-muted">
                      <th scope="col" className="px-5 py-3 font-medium">Anbieter</th>
                      <th scope="col" className="px-3 py-3 font-medium">Kategorie</th>
                      <th scope="col" className="px-3 py-3 font-medium">Kündigen bis</th>
                      <th scope="col" className="px-3 py-3 font-medium">Status</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">Pro Monat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {rows.map((r) => (
                      <tr key={r.id} className="transition-colors duration-200 hover:bg-subtle/60">
                        <td className="px-5 py-3.5">
                          <Link href={`/contracts/${r.id}`} className="font-medium hover:text-accent">{r.provider}</Link>
                          {r.customer_no && <div className="text-xs text-muted">Nr. {r.customer_no}</div>}
                        </td>
                        <td className="px-3 py-3.5 text-muted">{r.category}</td>
                        <td className="px-3 py-3.5 tabular-nums">
                          {r.deadline.traffic === "ended" ? <span className="text-muted">–</span> : (
                            <>
                              {dateDe(r.deadline.cancelBy)}
                              <div className="text-xs text-muted">{daysText(r.deadline.daysLeft)}</div>
                            </>
                          )}
                        </td>
                        <td className="px-3 py-3.5"><StatusBadge traffic={r.deadline.traffic} /></td>
                        <td className="px-5 py-3.5 text-right font-medium tabular-nums">{eur(monthlyCents(r))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
