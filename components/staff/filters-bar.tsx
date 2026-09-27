"use client";

import type { Facility } from "@/data/types";
import type { DateRangeDays, StaffFilters } from "@/lib/staff/types";

const RANGE_OPTIONS: { value: DateRangeDays; label: string }[] = [
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
  { value: 365, label: "Last 12 months" },
];

function FilterControls({
  facilities,
  filters,
  onChange,
}: {
  facilities: Facility[];
  filters: StaffFilters;
  onChange: (next: StaffFilters) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div>
        <label htmlFor="park-filter" className="block text-sm font-medium text-slate-700">
          Park
        </label>
        <select
          id="park-filter"
          value={filters.facilityId}
          onChange={(e) => onChange({ ...filters, facilityId: e.target.value })}
          className="mt-1 block w-full min-w-[10rem] rounded-md border border-slate-300 bg-white px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <option value="all">All parks</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="range-filter" className="block text-sm font-medium text-slate-700">
          Date range
        </label>
        <select
          id="range-filter"
          value={filters.rangeDays}
          onChange={(e) => onChange({ ...filters, rangeDays: Number(e.target.value) as DateRangeDays })}
          className="mt-1 block w-full min-w-[10rem] rounded-md border border-slate-300 bg-white px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {RANGE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function FiltersBar(props: {
  facilities: Facility[];
  filters: StaffFilters;
  onChange: (next: StaffFilters) => void;
}) {
  return (
    <div className="mb-6">
      <details className="sm:hidden">
        <summary className="min-h-11 cursor-pointer list-none rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700">
          Filters
        </summary>
        <div className="mt-3">
          <FilterControls {...props} />
        </div>
      </details>
      <div className="hidden sm:block">
        <FilterControls {...props} />
      </div>
    </div>
  );
}
