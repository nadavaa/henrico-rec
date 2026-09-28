"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Facility, ReservableSpace, SpaceType } from "@/data/types";
import { formatCents } from "@/lib/format";

const TYPE_LABELS: Record<SpaceType, string> = {
  "picnic-shelter": "Picnic Shelter",
  "multipurpose-room": "Multipurpose Room",
  pavilion: "Pavilion",
};

export function FacilitiesBrowser({
  spaces,
  facilities,
}: {
  spaces: ReservableSpace[];
  facilities: Facility[];
}) {
  const [facilityId, setFacilityId] = useState("all");
  const [minCapacity, setMinCapacity] = useState(0);

  const facilityById = useMemo(() => new Map(facilities.map((f) => [f.id, f])), [facilities]);

  const filtered = spaces.filter(
    (s) => (facilityId === "all" || s.facilityId === facilityId) && s.capacity >= minCapacity,
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Facilities &amp; Shelters</h1>
      <p className="mt-1 text-slate-600">Reserve a picnic shelter, room, or pavilion for your event.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="space-park-filter" className="block text-sm font-medium text-slate-700">
            Park
          </label>
          <select
            id="space-park-filter"
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
        <div>
          <label htmlFor="space-capacity-filter" className="block text-sm font-medium text-slate-700">
            Minimum capacity
          </label>
          <select
            id="space-capacity-filter"
            value={minCapacity}
            onChange={(e) => setMinCapacity(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <option value={0}>Any</option>
            <option value={30}>30+</option>
            <option value={50}>50+</option>
            <option value={100}>100+</option>
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500" aria-live="polite">
        {filtered.length} space{filtered.length === 1 ? "" : "s"} found
      </p>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((space) => {
          const facility = facilityById.get(space.facilityId);
          return (
            <li key={space.id}>
              <Link
                href={`/resident/facilities/${space.id}`}
                className="flex h-full flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {TYPE_LABELS[space.type]}
                </span>
                <span className="text-lg font-semibold text-slate-900">{space.name}</span>
                <span className="text-sm text-slate-600">{facility?.name}</span>
                <span className="text-sm text-slate-600">Capacity: {space.capacity}</span>
                <span className="mt-auto pt-2 text-sm font-medium text-slate-900">
                  {formatCents(space.hourlyRateCents)}/hour
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-8 rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
          No spaces match those filters.
        </p>
      )}
    </div>
  );
}
