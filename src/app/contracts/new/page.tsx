import { requireSession } from "@/lib/auth";
import { ContractForm } from "../ContractForm";

export default async function NewContract() {
  await requireSession();
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Neuer Vertrag</h1>
      <ContractForm />
    </main>
  );
}
