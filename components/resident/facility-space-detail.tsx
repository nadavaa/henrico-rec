"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import type { Facility, ReservableSpace } from "@/data/types";
import { formatCents } from "@/lib/format";
import { useFacilityReservations } from "@/lib/facilities/reservation-context";
import { TIME_BLOCKS, type ReservationOutcome } from "@/lib/facilities/types";
import { anyDateBooked } from "@/lib/facilities/availability";
import { DEMO_RESIDENT } from "@/lib/resident/demo-resident";
import { BookingWizard } from "./booking-wizard";

const HOURS_PER_BLOCK = 3;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function FacilitySpaceDetail({
  space,
  facility,
}: {
  space: ReservableSpace;
  facility: Facility | null;
}) {
  const { reservations, createReservation } = useFacilityReservations();
  const [phase, setPhase] = useState<"select" | "request">("select");
  const [date, setDate] = useState(addDaysIso(todayIso(), 1));
  const [timeBlockId, setTimeBlockId] = useState(TIME_BLOCKS[0].id);
  const [recurring, setRecurring] = useState(false);
  const [weeks, setWeeks] = useState(4);
  const dateInputId = useId();
  const weeksInputId = useId();

  const dates = useMemo(
    () => (recurring ? Array.from({ length: weeks }, (_, i) => addDaysIso(date, i * 7)) : [date]),
    [recurring, weeks, date],
  );

  const totalCents = space.hourlyRateCents * HOURS_PER_BLOCK * dates.length;
  const selectedBlock = TIME_BLOCKS.find((b) => b.id === timeBlockId);
  const selectedBlockUnavailable = anyDateBooked(reservations, space.id, dates, timeBlockId);

  if (phase === "request") {
    return (
      <BookingWizard<ReservationOutcome>
        heading={`Request ${space.name}`}
        priceCents={totalCents}
        priceSuffix={dates.length > 1 ? `for ${dates.length} dates` : "per booking"}
        defaultParticipantName={DEMO_RESIDENT.name}
        onSubmit={({ paymentId }) => {
          createReservation({
            spaceId: space.id,
            requesterName: DEMO_RESIDENT.name,
            dates,
            timeBlockId,
            recurring,
            amountCents: totalCents,
            paymentId,
          });
          return { status: "pending" };
        }}
        renderConfirmation={() => (
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold text-amber-700">Request submitted — pending approval</p>
            <p className="text-slate-600">
              Your request for <strong>{space.name}</strong> ({selectedBlock?.label}) on{" "}
              {dates.join(", ")} is pending staff review. You&apos;ll see the status in My Account.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link
                href="/resident/account"
                className="flex min-h-11 flex-1 items-center justify-center rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
              >
                View My Account
              </Link>
              <Link
                href="/resident/facilities"
                className="flex min-h-11 flex-1 items-center justify-center rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                Browse more spaces
              </Link>
            </div>
          </div>
        )}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/resident/facilities"
        className="text-sm font-medium text-blue-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        ← Back to facilities
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">{space.name}</h1>
      <p className="mt-2 text-slate-600">{space.description}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Location</dt>
          <dd className="text-slate-900">{facility?.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Capacity</dt>
          <dd className="text-slate-900">{space.capacity} guests</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Rate</dt>
          <dd className="text-slate-900">{formatCents(space.hourlyRateCents)}/hour</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Amenities</dt>
          <dd className="text-slate-900">{space.amenities.join(", ")}</dd>
        </div>
      </dl>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Choose a date and time</h2>

        <div className="mt-3">
          <label htmlFor={dateInputId} className="block text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            id={dateInputId}
            type="date"
            value={date}
            min={todayIso()}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          />
        </div>

        <div className="mt-4 flex items-start gap-2">
          <input
            id="recurring-checkbox"
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          />
          <label htmlFor="recurring-checkbox" className="text-sm text-slate-700">
            Repeat weekly (e.g. every Saturday)
          </label>
        </div>

        {recurring && (
          <div className="mt-2 ml-6">
            <label htmlFor={weeksInputId} className="block text-sm font-medium text-slate-700">
              Number of weeks
            </label>
            <input
              id={weeksInputId}
              type="number"
              min={2}
              max={8}
              value={weeks}
              onChange={(e) => setWeeks(Math.min(8, Math.max(2, Number(e.target.value))))}
              className="mt-1 block w-24 rounded-md border border-slate-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            />
            <p className="mt-2 text-sm text-slate-600" aria-live="polite">
              Dates: {dates.join(", ")}
            </p>
          </div>
        )}

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-slate-700">Time block</legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TIME_BLOCKS.map((block) => {
              const unavailable = anyDateBooked(reservations, space.id, dates, block.id);
              return (
                <label
                  key={block.id}
                  className={`flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                    unavailable
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "cursor-pointer border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="time-block"
                    value={block.id}
                    checked={timeBlockId === block.id}
                    disabled={unavailable}
                    onChange={() => setTimeBlockId(block.id)}
                    className="h-4 w-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  />
                  {block.label} {unavailable && <span>(Unavailable)</span>}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600">
            Total: <span className="font-semibold text-slate-900">{formatCents(totalCents)}</span>
          </p>
          <button
            type="button"
            disabled={selectedBlockUnavailable}
            onClick={() => setPhase("request")}
            className="min-h-11 rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Continue to request
          </button>
        </div>
      </div>
    </div>
  );
}
