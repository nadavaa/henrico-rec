"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Facility, Program, ProgramCategory } from "@/data/types";
import { CATEGORY_LABELS } from "@/lib/resident/constants";
import { formatCents } from "@/lib/format";
import { getRemainingSpots } from "@/lib/resident/capacity";
import { useResidentSession } from "@/lib/resident/session-context";

export function ProgramBrowser({
  programs,
  facilities,
}: {
  programs: Program[];
  facilities: Facility[];
}) {
  const { bookings } = useResidentSession();
  const [category, setCategory] = useState<ProgramCategory | "all">("all");
  const [facilityId, setFacilityId] = useState<string>("all");

  const facilityById = useMemo(
    () => new Map(facilities.map((f) => [f.id, f])),
    [facilities],
  );

  const filtered = programs.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (facilityId === "all" || p.facilityId === facilityId),
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Browse Programs</h1>
      <p className="mt-1 text-slate-600">Find a class or program at a park near you.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProgramCategory | "all")}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <option value="all">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="facility-filter" className="block text-sm font-medium text-slate-700">
            Park / rec center
          </label>
          <select
            id="facility-filter"
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <option value="all">All parks</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500" aria-live="polite">
        {filtered.length} program{filtered.length === 1 ? "" : "s"} found
      </p>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((program) => {
          const facility = facilityById.get(program.facilityId);
          const remaining = getRemainingSpots(program, bookings);
          const isFull = remaining <= 0;

          return (
            <li key={program.id}>
              <Link
                href={`/resident/programs/${program.id}`}
                className="flex h-full flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {CATEGORY_LABELS[program.category]}
                </span>
                <span className="text-lg font-semibold text-slate-900">{program.name}</span>
                <span className="text-sm text-slate-600">{facility?.name}</span>
                <span className="text-sm text-slate-600">{program.schedule}</span>
                <span className="mt-auto flex items-center justify-between pt-2 text-sm">
                  <span className="font-medium text-slate-900">
                    {formatCents(program.priceCents)}
                  </span>
                  <span
                    className={
                      isFull
                        ? "rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-800"
                        : "rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800"
                    }
                  >
                    {isFull
                      ? "Full, join waitlist"
                      : `${remaining} of ${program.capacity} spots left`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-8 rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
          No programs match those filters.
        </p>
      )}
    </div>
  );
}
