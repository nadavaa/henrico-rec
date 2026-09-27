"use client";

import Link from "next/link";
import type { Facility, Program } from "@/data/types";
import { CATEGORY_LABELS } from "@/lib/resident/constants";
import { formatCents } from "@/lib/format";
import { getConfirmedSessionCount, getRemainingSpots, getWaitlistCount } from "@/lib/resident/capacity";
import { useResidentSession } from "@/lib/resident/session-context";

export function ProgramDetail({ program, facility }: { program: Program; facility: Facility | null }) {
  const { bookings } = useResidentSession();
  const filled = program.enrolled + getConfirmedSessionCount(program, bookings);
  const remaining = getRemainingSpots(program, bookings);
  const isFull = remaining <= 0;
  const waitlisted = getWaitlistCount(program, bookings);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/resident"
        className="text-sm font-medium text-blue-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        ← Back to programs
      </Link>

      <span className="mt-4 block text-xs font-semibold uppercase tracking-wide text-blue-700">
        {CATEGORY_LABELS[program.category]}
      </span>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{program.name}</h1>
      <p className="mt-2 text-slate-600">{program.description}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Location</dt>
          <dd className="text-slate-900">{facility?.name ?? "—"}</dd>
          {facility && <dd className="text-sm text-slate-500">{facility.address}</dd>}
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Schedule</dt>
          <dd className="text-slate-900">{program.schedule}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Instructor</dt>
          <dd className="text-slate-900">{program.instructor}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Ages</dt>
          <dd className="text-slate-900">{program.ageRange}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Price</dt>
          <dd className="text-slate-900">{formatCents(program.priceCents)}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Capacity</span>
          <span className="text-slate-600">
            {isFull ? `Full — ${waitlisted} on waitlist` : `${remaining} of ${program.capacity} spots left`}
          </span>
        </div>
        <progress
          value={filled}
          max={program.capacity}
          aria-label={`${filled} of ${program.capacity} spots filled`}
          className="mt-2 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-blue-700 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-blue-700"
        />
      </div>

      <Link
        href={`/resident/programs/${program.id}/book`}
        className="mt-8 flex min-h-11 w-full items-center justify-center rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
      >
        {isFull ? "Join waitlist" : "Book this class"}
      </Link>
    </div>
  );
}
