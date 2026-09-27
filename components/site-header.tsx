import Link from "next/link";
import { SideSwitcher } from "./side-switcher";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-sm text-lg font-bold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <span aria-hidden="true">🌳</span>
          <span>Henrico Recreation &amp; Parks</span>
        </Link>
        <div className="flex items-center gap-3">
          <SideSwitcher />
          <span
            className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900"
            title="This is a demo. No real accounts, payments, or data are used."
          >
            Demo mode
          </span>
        </div>
      </div>
    </header>
  );
}
