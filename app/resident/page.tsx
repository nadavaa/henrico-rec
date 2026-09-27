import Link from "next/link";
import { getFacilities, getPrograms, getMembershipTiers } from "@/lib/data";

export default async function ResidentPage() {
  const [facilities, programs, tiers] = await Promise.all([
    getFacilities(),
    getPrograms(),
    getMembershipTiers(),
  ]);

  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="text-sm font-medium text-blue-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          ← Back home
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
          Resident Portal
        </h1>
        <p className="mt-2 text-slate-600">
          Class registration, membership management, and program browsing
          are coming in the next phase of this demo.
        </p>

        <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <dt className="text-sm text-slate-500">Facilities</dt>
            <dd className="text-2xl font-semibold text-slate-900">
              {facilities.length}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <dt className="text-sm text-slate-500">Programs &amp; classes</dt>
            <dd className="text-2xl font-semibold text-slate-900">
              {programs.length}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <dt className="text-sm text-slate-500">Membership tiers</dt>
            <dd className="text-2xl font-semibold text-slate-900">
              {tiers.length}
            </dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
