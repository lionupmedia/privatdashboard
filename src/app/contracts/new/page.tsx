import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { ArrowLeftIcon } from "@/components/icons";
import { ContractForm } from "../ContractForm";

export default async function NewContract({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireSession();
  const { error } = await searchParams;
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeftIcon width={16} height={16} />Übersicht</Link>
        <h1 className="mb-6 mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Neuer Vertrag</h1>
        <ContractForm error={!!error} />
      </main>
    </>
  );
}
