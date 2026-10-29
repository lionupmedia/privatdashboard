import { redirect } from "next/navigation";
import { checkPassword, startSession } from "@/lib/auth";
import { AlertIcon, LayersIcon } from "@/components/icons";

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
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-accent text-white">
            <LayersIcon width={24} height={24} />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Privat-Dashboard</h1>
          <p className="mt-1 text-muted">Bitte melde dich an.</p>
        </div>
        <form action={login} className="card space-y-4 p-6">
          <div>
            <label htmlFor="password" className="label">Passwort</label>
            <input id="password" name="password" type="password" autoComplete="current-password" autoFocus required className="input" />
          </div>
          {error && (
            <p role="alert" className="badge badge-red w-full !whitespace-normal !rounded-lg !px-3 !py-2 !text-sm">
              <AlertIcon width={16} height={16} className="shrink-0" />
              Das Passwort ist nicht korrekt.
            </p>
          )}
          <button className="btn btn-primary w-full">Anmelden</button>
        </form>
      </div>
    </main>
  );
}
