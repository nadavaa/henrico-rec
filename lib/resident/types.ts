export interface ClassBooking {
  id: string;
  programId: string;
  participantName: string;
  status: "confirmed" | "waitlisted";
  waitlistPosition?: number;
  amountCents: number;
  paymentId: string;
  createdAt: string;
  // Set when a cancellation elsewhere automatically promoted this booking
  // off the waitlist — shown as a banner in My Account.
  promotedFromWaitlist?: boolean;
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
