"use client";

import { createContext, useContext, useState, useMemo } from "react";
import type { Program, MembershipTier } from "@/data/types";
import type { ClassBooking, MembershipPurchase, BookingOutcome } from "./types";
import { getRemainingSpots, getWaitlistCount } from "./capacity";
import { DEMO_RESIDENT } from "./demo-resident";
import { useOutbox } from "@/lib/communications/outbox-context";

interface ResidentSessionValue {
  resident: typeof DEMO_RESIDENT;
  bookings: ClassBooking[];
  membership: MembershipPurchase | null;
  bookProgram: (
    program: Program,
    participantName: string,
    paymentId: string,
  ) => BookingOutcome;
  cancelBooking: (bookingId: string) => void;
  purchaseMembership: (tier: MembershipTier, paymentId: string) => void;
}

const ResidentSessionContext = createContext<ResidentSessionValue | null>(null);

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ResidentSessionProvider({
  children,
  programs,
}: {
  children: React.ReactNode;
  programs: Program[];
}) {
  const [bookings, setBookings] = useState<ClassBooking[]>([]);
  const [membership, setMembership] = useState<MembershipPurchase | null>(null);
  const { addEntry: addOutboxEntry } = useOutbox();

  const value = useMemo<ResidentSessionValue>(
    () => ({
      resident: DEMO_RESIDENT,
      bookings,
      membership,
      bookProgram: (program, participantName, paymentId) => {
        const remaining = getRemainingSpots(program, bookings);
        const isWaitlisted = remaining <= 0;
        const waitlistPosition = isWaitlisted
          ? getWaitlistCount(program, bookings) + 1
          : undefined;

        const booking: ClassBooking = {
          id: createId(),
          programId: program.id,
          participantName,
          status: isWaitlisted ? "waitlisted" : "confirmed",
          waitlistPosition,
          amountCents: program.priceCents,
          paymentId,
          createdAt: new Date().toISOString(),
        };

        setBookings((prev) => [...prev, booking]);
        return isWaitlisted
          ? { status: "waitlisted", position: waitlistPosition! }
          : { status: "confirmed" };
      },
      cancelBooking: (bookingId) => {
        // Deliberately not a setBookings functional-updater: it would call
        // addOutboxEntry as a side effect inside an updater, which React
        // (StrictMode in particular) may invoke more than once per call,
        // duplicating the notification. Reading `bookings` from the closure
        // instead matches bookProgram's pattern above.
        const target = bookings.find((b) => b.id === bookingId);
        if (!target) return;
        const withoutTarget = bookings.filter((b) => b.id !== bookingId);

        // Only canceling a confirmed spot can free one up for the waitlist.
        if (target.status !== "confirmed") {
          setBookings(withoutTarget);
          return;
        }

        const waitlistForProgram = withoutTarget
          .filter((b) => b.programId === target.programId && b.status === "waitlisted")
          .sort((a, b) => (a.waitlistPosition ?? 0) - (b.waitlistPosition ?? 0));
        const toPromote = waitlistForProgram[0];
        if (!toPromote) {
          setBookings(withoutTarget);
          return;
        }

        const program = programs.find((p) => p.id === target.programId);
        addOutboxEntry({
          audience: "Waitlist notification",
          recipientCount: 1,
          subject: `Notified ${toPromote.participantName} — spot opened in ${program?.name ?? "class"}`,
          automatic: true,
        });

        setBookings(
          withoutTarget.map((b) => {
            if (b.id === toPromote.id) {
              return { ...b, status: "confirmed", waitlistPosition: undefined, promotedFromWaitlist: true };
            }
            if (
              b.programId === target.programId &&
              b.status === "waitlisted" &&
              (b.waitlistPosition ?? 0) > (toPromote.waitlistPosition ?? 0)
            ) {
              return { ...b, waitlistPosition: (b.waitlistPosition ?? 1) - 1 };
            }
            return b;
          }),
        );
      },
      purchaseMembership: (tier, paymentId) => {
        const now = new Date();
        const expires = new Date(now);
        expires.setFullYear(expires.getFullYear() + 1);

        setMembership({
          id: createId(),
          tierId: tier.id,
          memberName: DEMO_RESIDENT.name,
          amountCents: tier.monthlyPriceCents,
          paymentId,
          purchasedAt: now.toISOString(),
          expiresAt: expires.toISOString(),
        });
      },
    }),
    [bookings, membership, programs, addOutboxEntry],
  );

  return (
    <ResidentSessionContext.Provider value={value}>
      {children}
    </ResidentSessionContext.Provider>
  );
}

export function useResidentSession(): ResidentSessionValue {
  const ctx = useContext(ResidentSessionContext);
  if (!ctx) {
    throw new Error("useResidentSession must be used within ResidentSessionProvider");
  }
  return ctx;
}
