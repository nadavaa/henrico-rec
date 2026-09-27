"use client";

import { createContext, useContext, useState, useMemo } from "react";
import type { Program, MembershipTier } from "@/data/types";
import type { ClassBooking, MembershipPurchase, BookingOutcome } from "./types";
import { getRemainingSpots, getWaitlistCount } from "./capacity";
import { DEMO_RESIDENT } from "./demo-resident";

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

export function ResidentSessionProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<ClassBooking[]>([]);
  const [membership, setMembership] = useState<MembershipPurchase | null>(null);

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
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
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
    [bookings, membership],
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
