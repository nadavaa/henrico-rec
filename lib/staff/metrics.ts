import type { Facility, MembershipTier, Member, Program, Transaction } from "@/data/types";
import type { ClassBooking, MembershipPurchase } from "@/lib/resident/types";
import { getConfirmedSessionCount, getWaitlistCount } from "@/lib/resident/capacity";
import { DEMO_RESIDENT } from "@/lib/resident/demo-resident";
import { CATEGORY_LABELS } from "@/lib/resident/constants";
import type {
  CapacityAlert,
  CategoryFillPoint,
  DateRangeDays,
  Kpis,
  MonthlyRevenuePoint,
  ParkEnrollmentPoint,
  StaffFilters,
  TransactionRow,
} from "./types";

// Date range / park filters only gate historical, transaction-based figures
// (revenue, the transactions table). Enrollment, fill-rate, and waitlist
// figures reflect current state and are only narrowed by park.

const PAYMENT_METHODS = ["Visa", "Mastercard", "Amex", "Discover"];

function paymentMethodFor(id: string): string {
  const hash = [...id].reduce((h, c) => h + c.charCodeAt(0), 0);
  return PAYMENT_METHODS[hash % PAYMENT_METHODS.length];
}

function rangeStartDate(rangeDays: DateRangeDays, today: Date): string {
  const d = new Date(today);
  d.setDate(d.getDate() - rangeDays);
  return d.toISOString().slice(0, 10);
}

function programsForFacility(programs: Program[], facilityId: string | "all"): Program[] {
  return facilityId === "all" ? programs : programs.filter((p) => p.facilityId === facilityId);
}

export function effectiveEnrolled(program: Program, bookings: ClassBooking[]): number {
  return program.enrolled + getConfirmedSessionCount(program, bookings);
}

export function fillRatePct(program: Program, bookings: ClassBooking[]): number {
  return (effectiveEnrolled(program, bookings) / program.capacity) * 100;
}

export function buildTransactionRows(
  transactions: Transaction[],
  members: Member[],
  programs: Program[],
  tiers: MembershipTier[],
  sessionBookings: ClassBooking[],
  sessionMembership: MembershipPurchase | null,
): TransactionRow[] {
  const memberById = new Map(members.map((m) => [m.id, m]));
  const programById = new Map(programs.map((p) => [p.id, p]));
  const tierById = new Map(tiers.map((t) => [t.id, t]));

  const seedRows: TransactionRow[] = transactions.map((t) => {
    const member = memberById.get(t.memberId);
    const memberName = member ? `${member.firstName} ${member.lastName}` : "Unknown";
    const itemLabel =
      t.type === "membership"
        ? `${tierById.get(t.membershipTierId ?? "")?.name ?? "Membership"} Membership`
        : (programById.get(t.programId ?? "")?.name ?? "Program");

    return {
      id: t.id,
      date: t.date,
      type: t.type,
      memberName,
      itemLabel,
      amountCents: t.amountCents,
      paymentMethod: paymentMethodFor(t.id),
      status: "Completed",
    };
  });

  const sessionEnrollmentRows: TransactionRow[] = sessionBookings.map((b) => ({
    id: b.id,
    date: b.createdAt.slice(0, 10),
    type: "enrollment",
    memberName: b.participantName,
    itemLabel: programById.get(b.programId)?.name ?? "Program",
    amountCents: b.amountCents,
    paymentMethod: paymentMethodFor(b.id),
    status: "Completed",
  }));

  const sessionMembershipRows: TransactionRow[] = sessionMembership
    ? [
        {
          id: sessionMembership.id,
          date: sessionMembership.purchasedAt.slice(0, 10),
          type: "membership",
          memberName: sessionMembership.memberName,
          itemLabel: `${tierById.get(sessionMembership.tierId)?.name ?? "Membership"} Membership`,
          amountCents: sessionMembership.amountCents,
          paymentMethod: paymentMethodFor(sessionMembership.id),
          status: "Completed",
        },
      ]
    : [];

  return [...seedRows, ...sessionEnrollmentRows, ...sessionMembershipRows].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
}

export function computeKpis(
  programs: Program[],
  members: Member[],
  transactionRows: TransactionRow[],
  sessionBookings: ClassBooking[],
  sessionMembership: MembershipPurchase | null,
  filters: StaffFilters,
  today: Date,
): Kpis {
  const scopedPrograms = programsForFacility(programs, filters.facilityId);
  const scopedProgramIds = new Set(scopedPrograms.map((p) => p.id));

  const startDate = rangeStartDate(filters.rangeDays, today);
  const revenueRows = transactionRows.filter((r) => r.date >= startDate);
  const totalRevenueCents = revenueRows.reduce((sum, r) => sum + r.amountCents, 0);

  const activeMembers = members.filter(
    (m) =>
      m.membershipTierId &&
      m.status === "active" &&
      (filters.facilityId === "all" || m.homeFacilityId === filters.facilityId),
  ).length;
  const activeMemberships = activeMembers + (sessionMembership ? 1 : 0);

  const classEnrollments = scopedPrograms.reduce(
    (sum, p) => sum + effectiveEnrolled(p, sessionBookings),
    0,
  );

  const avgFillRatePct =
    scopedPrograms.length === 0
      ? 0
      : scopedPrograms.reduce((sum, p) => sum + fillRatePct(p, sessionBookings), 0) /
        scopedPrograms.length;

  const waitlistedResidents = sessionBookings.filter(
    (b) => b.status === "waitlisted" && scopedProgramIds.has(b.programId),
  ).length;

  return {
    totalRevenueCents,
    activeMemberships,
    classEnrollments,
    avgFillRatePct,
    waitlistedResidents,
  };
}

export function computeRevenueByMonth(
  transactionRows: TransactionRow[],
  filters: StaffFilters,
  today: Date,
): MonthlyRevenuePoint[] {
  const startDate = rangeStartDate(filters.rangeDays, today);
  const scoped = transactionRows.filter((r) => r.date >= startDate);

  const byMonth = new Map<string, MonthlyRevenuePoint>();
  for (const row of scoped) {
    const monthKey = row.date.slice(0, 7);
    const label = new Date(`${monthKey}-01T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    });
    const point = byMonth.get(monthKey) ?? { month: label, membershipCents: 0, programCents: 0 };
    if (row.type === "membership") point.membershipCents += row.amountCents;
    else point.programCents += row.amountCents;
    byMonth.set(monthKey, point);
  }

  return [...byMonth.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([, v]) => v);
}

export function computeEnrollmentsByPark(
  programs: Program[],
  facilities: Facility[],
  sessionBookings: ClassBooking[],
  filters: StaffFilters,
): ParkEnrollmentPoint[] {
  const scopedPrograms = programsForFacility(programs, filters.facilityId);
  return facilities
    .filter((f) => filters.facilityId === "all" || f.id === filters.facilityId)
    .map((f) => ({
      park: f.name,
      enrollments: scopedPrograms
        .filter((p) => p.facilityId === f.id)
        .reduce((sum, p) => sum + effectiveEnrolled(p, sessionBookings), 0),
    }));
}

export function computeFillRateByCategory(
  programs: Program[],
  sessionBookings: ClassBooking[],
  filters: StaffFilters,
): CategoryFillPoint[] {
  const scopedPrograms = programsForFacility(programs, filters.facilityId);
  const byCategory = new Map<string, number[]>();
  for (const p of scopedPrograms) {
    const list = byCategory.get(p.category) ?? [];
    list.push(fillRatePct(p, sessionBookings));
    byCategory.set(p.category, list);
  }
  return Object.entries(CATEGORY_LABELS).map(([key, label]) => {
    const rates = byCategory.get(key) ?? [];
    const avg = rates.length === 0 ? 0 : rates.reduce((a, b) => a + b, 0) / rates.length;
    return { category: label, fillRatePct: avg };
  });
}

export function computeCapacityAlerts(
  programs: Program[],
  facilities: Facility[],
  sessionBookings: ClassBooking[],
  filters: StaffFilters,
): { overCapacity: CapacityAlert[]; underCapacity: CapacityAlert[] } {
  const facilityById = new Map(facilities.map((f) => [f.id, f]));
  const scopedPrograms = programsForFacility(programs, filters.facilityId);

  const alerts: CapacityAlert[] = scopedPrograms.map((p) => ({
    programId: p.id,
    programName: p.name,
    park: facilityById.get(p.facilityId)?.name ?? "—",
    schedule: p.schedule,
    fillRatePct: fillRatePct(p, sessionBookings),
    enrolled: effectiveEnrolled(p, sessionBookings),
    capacity: p.capacity,
  }));

  return {
    overCapacity: alerts.filter((a) => a.fillRatePct >= 90).sort((a, b) => b.fillRatePct - a.fillRatePct),
    underCapacity: alerts.filter((a) => a.fillRatePct < 30).sort((a, b) => a.fillRatePct - b.fillRatePct),
  };
}

export function getWaitlistCountForProgram(program: Program, bookings: ClassBooking[]): number {
  return getWaitlistCount(program, bookings);
}

export const STAFF_DEMO_RESIDENT_NAME = DEMO_RESIDENT.name;
