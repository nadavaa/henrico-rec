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
    const program = t.type === "enrollment" ? programById.get(t.programId ?? "") : undefined;
    const itemLabel =
      t.type === "membership"
        ? `${tierById.get(t.membershipTierId ?? "")?.name ?? "Membership"} Membership`
        : (program?.name ?? "Program");

    return {
      id: t.id,
      date: t.date,
      type: t.type,
      memberName,
      itemLabel,
      amountCents: t.amountCents,
      paymentMethod: paymentMethodFor(t.id),
      status: "Completed",
      facilityId: t.type === "enrollment" ? program?.facilityId : member?.homeFacilityId,
      programId: t.type === "enrollment" ? t.programId : undefined,
    };
  });

  const sessionEnrollmentRows: TransactionRow[] = sessionBookings.map((b) => {
    const program = programById.get(b.programId);
    return {
      id: b.id,
      date: b.createdAt.slice(0, 10),
      type: "enrollment",
      memberName: b.participantName,
      itemLabel: program?.name ?? "Program",
      amountCents: b.amountCents,
      paymentMethod: paymentMethodFor(b.id),
      status: "Completed",
      facilityId: program?.facilityId,
      programId: b.programId,
    };
  });

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
          facilityId: undefined,
          programId: undefined,
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

// ---------------------------------------------------------------------------
// Additional aggregates used by the AI reporting assistant (lib/ai/reports.ts).
// Kept here so the Staff dashboard and the AI answers are always computed the
// same way and can never disagree.
// ---------------------------------------------------------------------------

export function computeProgramRevenue(transactionRows: TransactionRow[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of transactionRows) {
    if (row.type === "enrollment" && row.programId) {
      map.set(row.programId, (map.get(row.programId) ?? 0) + row.amountCents);
    }
  }
  return map;
}

export interface TopProgramRow {
  programId: string;
  programName: string;
  park: string;
  enrolled: number;
  revenueCents: number;
}

export function computeTopPrograms(
  programs: Program[],
  facilities: Facility[],
  transactionRows: TransactionRow[],
  sessionBookings: ClassBooking[],
  metric: "enrollment" | "revenue",
  filters: StaffFilters,
  limit: number,
): TopProgramRow[] {
  const facilityById = new Map(facilities.map((f) => [f.id, f]));
  const revenueByProgram = computeProgramRevenue(transactionRows);
  const scopedPrograms = programsForFacility(programs, filters.facilityId);

  const rows: TopProgramRow[] = scopedPrograms.map((p) => ({
    programId: p.id,
    programName: p.name,
    park: facilityById.get(p.facilityId)?.name ?? "—",
    enrolled: effectiveEnrolled(p, sessionBookings),
    revenueCents: revenueByProgram.get(p.id) ?? 0,
  }));

  rows.sort((a, b) => (metric === "enrollment" ? b.enrolled - a.enrolled : b.revenueCents - a.revenueCents));
  return rows.slice(0, limit);
}

export interface WaitlistSummaryRow {
  programId: string;
  programName: string;
  park: string;
  schedule: string;
  waitlistCount: number;
}

export function computeWaitlistSummary(
  programs: Program[],
  facilities: Facility[],
  sessionBookings: ClassBooking[],
  filters: StaffFilters,
): WaitlistSummaryRow[] {
  const facilityById = new Map(facilities.map((f) => [f.id, f]));
  const scopedPrograms = programsForFacility(programs, filters.facilityId);

  return scopedPrograms
    .map((p) => ({
      programId: p.id,
      programName: p.name,
      park: facilityById.get(p.facilityId)?.name ?? "—",
      schedule: p.schedule,
      waitlistCount: getWaitlistCount(p, sessionBookings),
    }))
    .filter((row) => row.waitlistCount > 0)
    .sort((a, b) => b.waitlistCount - a.waitlistCount);
}

function monthKeyOf(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function monthLabel(monthKey: string): string {
  return new Date(`${monthKey}-01T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export interface MonthOverMonthResult {
  metric: "revenue" | "enrollments" | "memberships";
  currentMonthLabel: string;
  previousMonthLabel: string;
  currentValue: number;
  previousValue: number;
  pctChange: number | null; // null when previousValue is 0 (undefined percent change)
}

export function computeMonthOverMonth(
  transactionRows: TransactionRow[],
  metric: "revenue" | "enrollments" | "memberships",
  today: Date,
): MonthOverMonthResult {
  const currentMonthKey = today.toISOString().slice(0, 7);
  const prevDate = new Date(today);
  prevDate.setDate(1);
  prevDate.setMonth(prevDate.getMonth() - 1);
  const previousMonthKey = prevDate.toISOString().slice(0, 7);

  function valueForMonth(monthKey: string): number {
    const rowsInMonth = transactionRows.filter((r) => monthKeyOf(r.date) === monthKey);
    if (metric === "revenue") return rowsInMonth.reduce((sum, r) => sum + r.amountCents, 0);
    if (metric === "enrollments") return rowsInMonth.filter((r) => r.type === "enrollment").length;
    return rowsInMonth.filter((r) => r.type === "membership").length;
  }

  const currentValue = valueForMonth(currentMonthKey);
  const previousValue = valueForMonth(previousMonthKey);
  const pctChange = previousValue === 0 ? null : ((currentValue - previousValue) / previousValue) * 100;

  return {
    metric,
    currentMonthLabel: monthLabel(currentMonthKey),
    previousMonthLabel: monthLabel(previousMonthKey),
    currentValue,
    previousValue,
    pctChange,
  };
}

export interface MembershipsByParkRow {
  facilityId: string;
  park: string;
  membershipsSold: number;
  revenueCents: number;
}

export function computeMembershipsByPark(
  facilities: Facility[],
  transactionRows: TransactionRow[],
  filters: StaffFilters,
  today: Date,
): MembershipsByParkRow[] {
  const startDate = rangeStartDate(filters.rangeDays, today);
  const scoped = transactionRows.filter(
    (r) => r.type === "membership" && r.date >= startDate && r.facilityId,
  );

  const scopedFacilities = facilities.filter(
    (f) => filters.facilityId === "all" || f.id === filters.facilityId,
  );

  return scopedFacilities.map((f) => {
    const rows = scoped.filter((r) => r.facilityId === f.id);
    return {
      facilityId: f.id,
      park: f.name,
      membershipsSold: rows.length,
      revenueCents: rows.reduce((sum, r) => sum + r.amountCents, 0),
    };
  });
}
