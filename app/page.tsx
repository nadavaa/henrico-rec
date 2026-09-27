import Link from "next/link";

export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Henrico County Recreation &amp; Parks
          </h1>
          <p className="mt-4 text-lg leading-7 text-slate-600">
            Register for classes, manage your membership, and browse programs
            at parks and recreation centers across the county.
          </p>
        </div>

        <nav
          aria-label="Choose your portal"
          className="mx-auto mt-12 grid w-full max-w-2xl gap-6 sm:grid-cols-2"
        >
          <Link
            href="/resident"
            className="group flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl"
            >
              🏃
            </span>
            <span className="text-xl font-semibold text-slate-900 group-hover:text-blue-700">
              Resident
            </span>
            <span className="text-sm text-slate-600">
              Browse classes, check membership status, and register for
              programs.
            </span>
          </Link>

          <Link
            href="/staff"
            className="group flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl"
            >
              🗂️
            </span>
            <span className="text-xl font-semibold text-slate-900 group-hover:text-blue-700">
              Staff
            </span>
            <span className="text-sm text-slate-600">
              Manage facilities, programs, members, and enrollment.
            </span>
          </Link>
        </nav>
      </div>
    </main>
  );
}
