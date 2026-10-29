import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { allContracts, eur } from "@/lib/contracts";
import { monthlyCents } from "@/lib/db";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

const dot = { green: "bg-green-500", yellow: "bg-yellow-400", red: "bg-red-500", ended: "bg-gray-400" } as const;

export default async function Home() {
  await requireSession();
  const rows = allContracts();
  const active = rows.filter((r) => r.deadline.traffic !== "ended");
  const monthly = active.reduce((s, r) => s + monthlyCents(r), 0);
  const upcoming = active.filter((r) => r.deadline.daysLeft <= 90);

  const byCat = new Map<string, number>();
  for (const r of active) byCat.set(r.category, (byCat.get(r.category) ?? 0) + monthlyCents(r));

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Privat-Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/contracts/new" className="rounded bg-black px-3 py-1 text-white">+ Vertrag</Link>
          <form action={logout}><button className="underline">Abmelden</button></form>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded border p-3"><div className="text-sm text-gray-500">Fixkosten / Monat</div><div className="text-xl">{eur(monthly)}</div></div>
        <div className="rounded border p-3"><div className="text-sm text-gray-500">Fixkosten / Jahr</div><div className="text-xl">{eur(monthly * 12)}</div></div>
        <div className="rounded border p-3"><div className="text-sm text-gray-500">Fristen ≤ 90 Tage</div><div className="text-xl">{upcoming.length}</div></div>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Nach Kategorie (pro Monat)</h2>
        <ul className="text-sm">
          {[...byCat].sort((a, b) => b[1] - a[1]).map(([cat, c]) => (
            <li key={cat} className="flex justify-between border-b py-1"><span>{cat}</span><span>{eur(c)}</span></li>
          ))}
        </ul>
      </section>

      <h2 className="mb-2 text-lg font-semibold">Verträge</h2>
      <table className="w-full text-left text-sm">
        <thead><tr className="border-b"><th className="py-1">Frist</th><th>Anbieter</th><th>Kategorie</th><th>Kündigen bis</th><th>Tage</th><th className="text-right">Monat</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="py-1"><span className={`inline-block h-3 w-3 rounded-full ${dot[r.deadline.traffic]}`} title={r.deadline.traffic} /></td>
              <td><Link className="underline" href={`/contracts/${r.id}`}>{r.provider}</Link></td>
              <td>{r.category}</td>
              <td>{new Date(r.deadline.cancelBy).toLocaleDateString("de-DE")}</td>
              <td>{r.deadline.traffic === "ended" ? "beendet" : r.deadline.daysLeft}</td>
              <td className="text-right">{eur(monthlyCents(r))}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={6} className="py-4 text-gray-500">Noch keine Verträge.</td></tr>}
        </tbody>
      </table>
    </main>
  );
}
