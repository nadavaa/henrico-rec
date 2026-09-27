"use client";

import { useState } from "react";
import Link from "next/link";
import type { Facility, Member, Program } from "@/data/types";
import { useResidentSession } from "@/lib/resident/session-context";
import { getRosterForProgram } from "@/lib/staff/roster";

export function ProgramRoster({
  program,
  facility,
  members,
}: {
  program: Program;
  facility: Facility | null;
  members: Member[];
}) {
  const { bookings } = useResidentSession();
  const roster = getRosterForProgram(program, members, bookings);
  const [checkedIn, setCheckedIn] = useState<Record<string, boolean>>({});

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/staff/programs"
        className="text-sm font-medium text-blue-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        ← Back to programs
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">{program.name}</h1>
      <p className="mt-1 text-slate-600">
        {facility?.name} · {program.schedule}
      </p>

      <h2 className="mt-6 text-lg font-semibold text-slate-900">
        Roster ({roster.length} of {program.capacity})
      </h2>

      <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {roster.map((entry) => {
          const isChecked = checkedIn[entry.id] ?? false;
          return (
            <li key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{entry.name}</p>
                {entry.fromSession && (
                  <span className="text-xs font-medium text-blue-700">Booked this session</span>
                )}
              </div>
              <label className="flex min-h-9 items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    setCheckedIn((prev) => ({ ...prev, [entry.id]: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                />
                Checked in
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
