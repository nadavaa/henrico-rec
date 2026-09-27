"use client";

import { useState } from "react";
import Link from "next/link";
import type { Facility, MembershipTier, Program } from "@/data/types";
import { formatCents, formatDate } from "@/lib/format";
import { useResidentSession } from "@/lib/resident/session-context";
import { QrCode } from "./qr-code";

export function AccountView({
  programs,
  facilities,
  tiers,
}: {
  programs: Program[];
  facilities: Facility[];
  tiers: MembershipTier[];
}) {
  const { resident, bookings, membership, cancelBooking } = useResidentSession();
  const [announcement, setAnnouncement] = useState("");

  const tier = membership ? tiers.find((t) => t.id === membership.tierId) : null;

  function handleCancel(bookingId: string, programName: string) {
    cancelBooking(bookingId);
    setAnnouncement(`Canceled booking for ${programName}.`);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Account</h1>
      <p className="mt-1 text-slate-600">{resident.name}</p>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Upcoming Bookings</h2>
        {bookings.length === 0 ? (
          <p className="mt-2 rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
            No bookings yet.{" "}
            <Link href="/resident" className="font-medium text-blue-700 hover:underline">
              Browse programs
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {bookings.map((booking) => {
              const program = programs.find((p) => p.id === booking.programId);
              const facility = program ? facilities.find((f) => f.id === program.facilityId) : null;
              return (
                <li
                  key={booking.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{program?.name ?? "Program"}</p>
                    <p className="text-sm text-slate-600">
                      {facility?.name} · {program?.schedule}
                    </p>
                    <span
                      className={
                        booking.status === "confirmed"
                          ? "mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                          : "mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                      }
                    >
                      {booking.status === "confirmed"
                        ? "Confirmed"
                        : `Waitlisted — #${booking.waitlistPosition}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCancel(booking.id, program?.name ?? "this program")}
                    className="min-h-11 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    Cancel
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Membership Card</h2>
        {!membership || !tier ? (
          <p className="mt-2 rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
            You don&apos;t have a membership yet.{" "}
            <Link href="/resident/memberships" className="font-medium text-blue-700 hover:underline">
              View plans
            </Link>
            .
          </p>
        ) : (
          <div className="mt-3 flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
            <QrCode value={resident.memberId} />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="font-medium text-slate-500">Member</dt>
              <dd className="text-slate-900">{resident.name}</dd>
              <dt className="font-medium text-slate-500">Plan</dt>
              <dd className="text-slate-900">{tier.name}</dd>
              <dt className="font-medium text-slate-500">Member ID</dt>
              <dd className="font-mono text-slate-900">{resident.memberId}</dd>
              <dt className="font-medium text-slate-500">Price</dt>
              <dd className="text-slate-900">{formatCents(membership.amountCents)}/mo</dd>
              <dt className="font-medium text-slate-500">Expires</dt>
              <dd className="text-slate-900">{formatDate(membership.expiresAt)}</dd>
            </dl>
          </div>
        )}
      </section>
    </div>
  );
}
