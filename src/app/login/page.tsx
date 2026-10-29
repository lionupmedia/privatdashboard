import { redirect } from "next/navigation";
import { checkPassword, startSession } from "@/lib/auth";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  async function login(form: FormData) {
    "use server";
    if (await checkPassword(String(form.get("password") ?? ""))) {
      await startSession();
      redirect("/");
    }
    redirect("/login?error=1");
  }

  return (
    <main className="mx-auto mt-32 max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-semibold">Privat-Dashboard</h1>
      <form action={login} className="flex flex-col gap-3">
        <input name="password" type="password" autoFocus required placeholder="Passwort" className="rounded border p-2" />
        {error && <p className="text-sm text-red-600">Falsches Passwort.</p>}
        <button className="rounded bg-black p-2 text-white">Anmelden</button>
      </form>
    </main>
  );
}
