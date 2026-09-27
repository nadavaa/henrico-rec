"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Facility, Program, Transaction } from "@/data/types";
import { CATEGORY_LABELS } from "@/lib/resident/constants";
import { useResidentSession } from "@/lib/resident/session-context";
import { formatCents } from "@/lib/format";
import { effectiveEnrolled, fillRatePct, getWaitlistCountForProgram } from "@/lib/staff/metrics";

type SortKey = "name" | "park" | "category" | "enrolled" | "waitlist" | "revenue";

function SortButton({
  column,
  sortKey,
  sortDir,
  onToggle,
  children,
}: {
  column: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onToggle: (column: SortKey) => void;
  children: React.ReactNode;
}) {
  const active = sortKey === column;
  return (
    <button
      type="button"
      onClick={() => onToggle(column)}
      className="flex min-h-9 items-center gap-1 font-medium text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      aria-label={`Sort by ${column}`}
    >
      {children}
      {active && <span aria-hidden="true">{sortDir === "asc" ? "▲" : "▼"}</span>}
    </button>
  );
}

export function ProgramsTable({
  programs,
  facilities,
  transactions,
}: {
  programs: Program[];
  facilities: Facility[];
  transactions: Transaction[];
}) {
  const { bookings } = useResidentSession();
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const facilityById = useMemo(() => new Map(facilities.map((f) => [f.id, f])), [facilities]);

  const revenueByProgram = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type === "enrollment" && t.programId) {
        map.set(t.programId, (map.get(t.programId) ?? 0) + t.amountCents);
      }
    }
    for (const b of bookings) {
      map.set(b.programId, (map.get(b.programId) ?? 0) + b.amountCents);
    }
    return map;
  }, [transactions, bookings]);

  const rows = useMemo(() => {
    return programs.map((p) => ({
      program: p,
      park: facilityById.get(p.facilityId)?.name ?? "—",
      enrolled: effectiveEnrolled(p, bookings),
      waitlist: getWaitlistCountForProgram(p, bookings),
      fillRate: fillRatePct(p, bookings),
      revenueCents: revenueByProgram.get(p.id) ?? 0,
    }));
  }, [programs, bookings, facilityById, revenueByProgram]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.program.name.localeCompare(b.program.name);
          break;
        case "park":
          cmp = a.park.localeCompare(b.park);
          break;
        case "category":
          cmp = a.program.category.localeCompare(b.program.category);
          break;
        case "enrolled":
          cmp = a.fillRate - b.fillRate;
          break;
        case "waitlist":
          cmp = a.waitlist - b.waitlist;
          break;
        case "revenue":
          cmp = a.revenueCents - b.revenueCents;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Programs</h1>
      <p className="mt-1 text-slate-600">All classes across every park. Click a row for its roster.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="px-3 py-2">
                <SortButton column="name" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort}>Name</SortButton>
              </th>
              <th scope="col" className="px-3 py-2">
                <SortButton column="park" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort}>Park</SortButton>
              </th>
              <th scope="col" className="px-3 py-2">
                <SortButton column="category" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort}>Category</SortButton>
              </th>
              <th scope="col" className="px-3 py-2">Schedule</th>
              <th scope="col" className="px-3 py-2">
                <SortButton column="enrolled" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort}>Enrolled / capacity</SortButton>
              </th>
              <th scope="col" className="px-3 py-2">
                <SortButton column="waitlist" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort}>Waitlist</SortButton>
              </th>
              <th scope="col" className="px-3 py-2">
                <SortButton column="revenue" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort}>Revenue</SortButton>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.program.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-3 py-2">
                  <Link
                    href={`/staff/programs/${row.program.id}`}
                    className="font-medium text-blue-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    {row.program.name}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700">{row.park}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                  {CATEGORY_LABELS[row.program.category]}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700">{row.program.schedule}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                  {row.enrolled}/{row.program.capacity} ({Math.round(row.fillRate)}%)
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700">{row.waitlist}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                  {formatCents(row.revenueCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
