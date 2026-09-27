"use client";

import Link from "next/link";
import type { Facility, Program } from "@/data/types";
import { BookingWizard } from "./booking-wizard";
import { useResidentSession } from "@/lib/resident/session-context";
import { DEMO_RESIDENT } from "@/lib/resident/demo-resident";
import type { BookingOutcome } from "@/lib/resident/types";

export function ClassBookingWizard({
  program,
  facility,
}: {
  program: Program;
  facility: Facility | null;
}) {
  const { bookProgram } = useResidentSession();

  return (
    <BookingWizard<BookingOutcome>
      heading={`Book ${program.name}`}
      priceCents={program.priceCents}
      priceSuffix="per session"
      defaultParticipantName={DEMO_RESIDENT.name}
      onSubmit={({ participantName, paymentId }) =>
        bookProgram(program, participantName, paymentId)
      }
      renderConfirmation={(outcome, participantName) => (
        <div className="space-y-4 text-center">
          {outcome.status === "confirmed" ? (
            <>
              <p className="text-lg font-semibold text-emerald-700">You&apos;re booked!</p>
              <p className="text-slate-600">
                {participantName} is confirmed for <strong>{program.name}</strong> at{" "}
                {facility?.name}, {program.schedule}.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-amber-700">You&apos;re on the waitlist</p>
              <p className="text-slate-600">
                {program.name} is full. {participantName} is <strong>#{outcome.position}</strong>{" "}
                on the waitlist and will be notified if a spot opens up.
              </p>
            </>
          )}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/resident/account"
              className="flex min-h-11 flex-1 items-center justify-center rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
            >
              View My Account
            </Link>
            <Link
              href="/resident"
              className="flex min-h-11 flex-1 items-center justify-center rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Browse more classes
            </Link>
          </div>
        </div>
      )}
    />
  );
}
