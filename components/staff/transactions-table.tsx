"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Facility, Member, MembershipTier, Program, Transaction } from "@/data/types";
import { useResidentSession } from "@/lib/resident/session-context";
import { formatCents } from "@/lib/format";
import type { DateRangeDays, StaffFilters } from "@/lib/staff/types";
import { buildTransactionRows } from "@/lib/staff/metrics";
import { downloadCsv, transactionsToCsv } from "@/lib/staff/csv";
import { FiltersBar } from "./filters-bar";

const VALID_RANGES: DateRangeDays[] = [30, 90, 365];

function rangeStart(rangeDays: number, today: Date): string {
  const d = new Date(today);
  d.setDate(d.getDate() - rangeDays);
  return d.toISOString().slice(0, 10);
}

export function TransactionsTable({
  transactions,
  members,
  programs,
  tiers,
  facilities,
}: {
  transactions: Transaction[];
  members: Member[];
  programs: Program[];
  tiers: MembershipTier[];
  facilities: Facility[];
}) {
  const { bookings, membership } = useResidentSession();
  const searchParams = useSearchParams();

  const initialPark = searchParams.get("park");
  const initialRange = Number(searchParams.get("range")) as DateRangeDays;

  const [filters, setFilters] = useState<StaffFilters>({
    facilityId: initialPark && facilities.some((f) => f.id === initialPark) ? initialPark : "all",
    rangeDays: VALID_RANGES.includes(initialRange) ? initialRange : 30,
  });
  const today = useMemo(() => new Date(), []);

  const allRows = useMemo(
    () => buildTransactionRows(transactions, members, programs, tiers, bookings, membership),
    [transactions, members, programs, tiers, bookings, membership],
  );

  const filteredRows = useMemo(() => {
    const startDate = rangeStart(filters.rangeDays, today);
    return allRows.filter((row) => {
      if (row.date < startDate) return false;
      if (filters.facilityId === "all") return true;
      // Rows with no facility (e.g. the demo resident's membership purchase)
      // always pass through, since they aren't tied to a single park.
      return row.facilityId === undefined ? true : row.facilityId === filters.facilityId;
    });
  }, [allRows, filters, today]);

  function handleExport() {
    const csv = transactionsToCsv(filteredRows);
    downloadCsv(`transactions-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Transactions</h1>
          <p className="mt-1 text-slate-600">Membership and program payments.</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="min-h-11 rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
        >
          Export CSV
        </button>
      </div>

      <div className="mt-6">
        <FiltersBar facilities={facilities} filters={filters} onChange={setFilters} />
      </div>

      <p className="text-sm text-slate-500" aria-live="polite">
        {filteredRows.length} transaction{filteredRows.length === 1 ? "" : "s"}
      </p>

      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="px-3 py-2 font-medium text-slate-600">Date</th>
              <th scope="col" className="px-3 py-2 font-medium text-slate-600">Resident</th>
              <th scope="col" className="px-3 py-2 font-medium text-slate-600">Item</th>
              <th scope="col" className="px-3 py-2 font-medium text-slate-600">Amount</th>
              <th scope="col" className="px-3 py-2 font-medium text-slate-600">Method</th>
              <th scope="col" className="px-3 py-2 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0">
                <td className="whitespace-nowrap px-3 py-2 text-slate-700">{row.date}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700">{row.memberName}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700">{row.itemLabel}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                  {formatCents(row.amountCents)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700">{row.paymentMethod}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
