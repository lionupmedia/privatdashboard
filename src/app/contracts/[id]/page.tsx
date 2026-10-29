import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db, type Contract, type Doc } from "@/lib/db";
import { deleteContract } from "@/app/actions";
import { ContractForm } from "../ContractForm";

export default async function EditContract({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const c = db.prepare("SELECT * FROM contracts WHERE id = ?").get(Number(id)) as Contract | undefined;
  if (!c) notFound();
  const docs = db.prepare("SELECT * FROM documents WHERE contract_id = ?").all(c.id) as Doc[];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">{c.provider}</h1>
      <ContractForm c={c} />

      <h2 className="mb-2 mt-8 text-lg font-semibold">Dokumente</h2>
      <ul className="mb-3 list-disc pl-5">
        {docs.map((d) => (
          <li key={d.id}><a className="underline" href={`/files/${d.id}`}>{d.filename}</a></li>
        ))}
        {docs.length === 0 && <li className="list-none text-gray-500">Noch keine Dokumente.</li>}
      </ul>
      <form action="/files/upload" method="post" encType="multipart/form-data" className="flex gap-2">
        <input type="hidden" name="contract_id" value={c.id} />
        <input type="file" name="file" accept="application/pdf" required />
        <button className="rounded border px-3 py-1">Hochladen</button>
      </form>

      <form action={deleteContract} className="mt-8">
        <input type="hidden" name="id" value={c.id} />
        <button className="text-red-600 underline">Vertrag löschen</button>
      </form>
    </main>
  );
}
