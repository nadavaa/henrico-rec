import type { Member, Program } from "@/data/types";
import type { ClassBooking } from "@/lib/resident/types";

export interface RosterEntry {
  id: string;
  name: string;
  fromSession: boolean;
}

// Seed data only tracks an aggregate `enrolled` count per program, not which
// specific members are in which class. For a front-desk roster demo, we
// deterministically pick that many members (stable across renders) and
// append any resident who booked this program in the current session.
function hashString(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function getRosterForProgram(
  program: Program,
  members: Member[],
  sessionBookings: ClassBooking[],
): RosterEntry[] {
  const offset = hashString(program.id) % members.length;
  const seedRoster: RosterEntry[] = Array.from({ length: program.enrolled }, (_, i) => {
    const m = members[(offset + i) % members.length];
    return { id: m.id, name: `${m.firstName} ${m.lastName}`, fromSession: false };
  });

  const sessionRoster: RosterEntry[] = sessionBookings
    .filter((b) => b.programId === program.id && b.status === "confirmed")
    .map((b) => ({ id: b.id, name: b.participantName, fromSession: true }));

  return [...seedRoster, ...sessionRoster];
}
