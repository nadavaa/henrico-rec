"use client";

import Link from "next/link";
import type { MembershipTier } from "@/data/types";
import { BookingWizard } from "./booking-wizard";
import { useResidentSession } from "@/lib/resident/session-context";
import { DEMO_RESIDENT } from "@/lib/resident/demo-resident";

export function MembershipPurchaseWizard({ tier }: { tier: MembershipTier }) {
  const { purchaseMembership } = useResidentSession();

  return (
    <BookingWizard<{ status: "purchased" }>
      heading={`Join ${tier.name} Membership`}
      priceCents={tier.monthlyPriceCents}
      priceSuffix="per month"
      defaultParticipantName={DEMO_RESIDENT.name}
      onSubmit={({ paymentId }) => {
        purchaseMembership(tier, paymentId);
        return { status: "purchased" as const };
      }}
      renderConfirmation={(_outcome, participantName) => (
        <div className="space-y-4 text-center">
          <p className="text-lg font-semibold text-emerald-700">Welcome to the club!</p>
          <p className="text-slate-600">
            {participantName} is now enrolled in the <strong>{tier.name}</strong> membership.
            Your digital membership card is ready in My Account.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/resident/account"
              className="flex min-h-11 flex-1 items-center justify-center rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
            >
              View My Membership Card
            </Link>
            <Link
              href="/resident"
              className="flex min-h-11 flex-1 items-center justify-center rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Browse programs
            </Link>
          </div>
        </div>
      )}
    />
  );
}
