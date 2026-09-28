export type ReservationStatus = "pending" | "approved" | "denied";

export interface TimeBlock {
  id: string;
  label: string;
  startHour: number;
  endHour: number;
}

// Attachment J §11.1.3-ish: fixed daily blocks rather than arbitrary times,
// to keep the calendar simple.
export const TIME_BLOCKS: TimeBlock[] = [
  { id: "9-12", label: "9:00 AM – 12:00 PM", startHour: 9, endHour: 12 },
  { id: "12-3", label: "12:00 PM – 3:00 PM", startHour: 12, endHour: 15 },
  { id: "3-6", label: "3:00 PM – 6:00 PM", startHour: 15, endHour: 18 },
  { id: "6-9", label: "6:00 PM – 9:00 PM", startHour: 18, endHour: 21 },
];

export interface ReservationRequest {
  id: string;
  spaceId: string;
  requesterName: string;
  dates: string[]; // ISO yyyy-mm-dd, one entry per occurrence (recurring support)
  timeBlockId: string;
  recurring: boolean;
  status: ReservationStatus;
  amountCents: number; // total across all dates
  paymentId: string;
  createdAt: string;
}

export type ReservationOutcome = { status: "pending" };
