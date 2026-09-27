import type { Program } from "@/data/types";
import type { ClassBooking } from "./types";

export function getConfirmedSessionCount(
  program: Program,
  bookings: ClassBooking[],
): number {
  return bookings.filter(
    (b) => b.programId === program.id && b.status === "confirmed",
  ).length;
}

export function getRemainingSpots(
  program: Program,
  bookings: ClassBooking[],
): number {
  return Math.max(
    0,
    program.capacity - program.enrolled - getConfirmedSessionCount(program, bookings),
  );
}

export function getWaitlistCount(
  program: Program,
  bookings: ClassBooking[],
): number {
  return bookings.filter(
    (b) => b.programId === program.id && b.status === "waitlisted",
  ).length;
}
