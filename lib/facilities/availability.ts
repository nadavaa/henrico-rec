import type { ReservationRequest } from "./types";

// Only approved reservations block a slot — a pending request is just a
// request (Attachment J §11.2.3's request/review/approve workflow), so two
// residents can both have pending requests on the same slot until staff
// approves one.
export function isSlotBooked(
  reservations: ReservationRequest[],
  spaceId: string,
  date: string,
  timeBlockId: string,
): boolean {
  return reservations.some(
    (r) =>
      r.spaceId === spaceId &&
      r.timeBlockId === timeBlockId &&
      r.status === "approved" &&
      r.dates.includes(date),
  );
}

export function anyDateBooked(
  reservations: ReservationRequest[],
  spaceId: string,
  dates: string[],
  timeBlockId: string,
): boolean {
  return dates.some((date) => isSlotBooked(reservations, spaceId, date, timeBlockId));
}
