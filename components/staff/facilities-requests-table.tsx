"use client";

import { useMemo } from "react";
import type { Facility, ReservableSpace } from "@/data/types";
import { useFacilityReservations } from "@/lib/facilities/reservation-context";
import { TIME_BLOCKS } from "@/lib/facilities/types";
import { formatCents } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  denied: "bg-red-100 text-red-800",
};

export function FacilitiesRequestsTable({
  spaces,
  facilities,
}: {
  spaces: ReservableSpace[];
  facilities: Facility[];
}) {
  const { reservations, approveReservation, denyReservation } = useFacilityReservations();
  const spaceById = useMemo(() => new Map(spaces.map((s) => [s.id, s])), [spaces]);
  const facilityById = useMemo(() => new Map(facilities.map((f) => [f.id, f])), [facilities]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Facilities &amp; Shelters</h1>
      <p className="mt-1 text-slate-600">
        Reservation requests for picnic shelters, rooms, and pavilions. Approving a request blocks
        that time slot from other residents.
      </p>

      {reservations.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
          No reservation requests yet this session.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Resident</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Space</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Park</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Date(s)</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Time</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Amount</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Status</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const space = spaceById.get(r.spaceId);
                const facility = space ? facilityById.get(space.facilityId) : null;
                const block = TIME_BLOCKS.find((b) => b.id === r.timeBlockId);
                return (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0">
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700">{r.requesterName}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700">{space?.name ?? "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700">{facility?.name ?? "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700">{r.dates.join(", ")}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700">{block?.label ?? "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                      {formatCents(r.amountCents)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {r.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => approveReservation(r.id)}
                            className="min-h-9 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => denyReservation(r.id)}
                            className="min-h-9 rounded-md border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                          >
                            Deny
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
