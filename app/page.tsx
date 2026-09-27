import Link from "next/link";

export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Response to Henrico County RFP No. 26-2996-8ARA
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Recreation Management Software System
          </h1>
          <p className="mt-1 text-base font-medium text-slate-500">(Demo)</p>
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

        <p className="mx-auto mt-8 text-center text-sm text-slate-500">
          <Link
            href="/rfp-coverage"
            className="font-medium text-blue-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            See how this demo covers the RFP&apos;s requirements
          </Link>
        </p>
      </div>
    </main>
  );
}
