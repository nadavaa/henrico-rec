import type { Member, Program } from "@/data/types";
import type { ClassBooking } from "@/lib/resident/types";
import { effectiveEnrolled, getWaitlistCountForProgram } from "@/lib/staff/metrics";

export function getClassRosterCount(program: Program, bookings: ClassBooking[]): number {
  return effectiveEnrolled(program, bookings);
}

export function getFacilityWaitlistCount(
  facilityId: string,
  programs: Program[],
  bookings: ClassBooking[],
): number {
  return programs
    .filter((p) => p.facilityId === facilityId)
    .reduce((sum, p) => sum + getWaitlistCountForProgram(p, bookings), 0);
}

export function getActiveMembersCount(members: Member[]): number {
  return members.filter((m) => m.status === "active").length;
}
