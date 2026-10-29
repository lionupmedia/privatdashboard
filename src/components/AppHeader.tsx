import Link from "next/link";
import { logout } from "@/app/actions";
import { LayersIcon, LogoutIcon, PlusIcon } from "./icons";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 whitespace-nowrap font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
            <LayersIcon width={17} height={17} />
          </span>
          Privat-Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/contracts/new" className="btn btn-primary" aria-label="Neuer Vertrag">
            <PlusIcon width={16} height={16} />
            <span className="hidden sm:inline">Neuer Vertrag</span>
            <span className="sm:hidden" aria-hidden="true">Neu</span>
          </Link>
          <form action={logout}>
            <button className="btn btn-ghost btn-icon" aria-label="Abmelden" title="Abmelden">
              <LogoutIcon />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
