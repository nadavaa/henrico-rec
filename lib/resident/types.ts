export interface ClassBooking {
  id: string;
  programId: string;
  participantName: string;
  status: "confirmed" | "waitlisted";
  waitlistPosition?: number;
  amountCents: number;
  paymentId: string;
  createdAt: string;
}

export interface MembershipPurchase {
  id: string;
  tierId: string;
  memberName: string;
  amountCents: number;
  paymentId: string;
  purchasedAt: string;
  expiresAt: string;
}

export type BookingOutcome =
  | { status: "confirmed" }
  | { status: "waitlisted"; position: number };
