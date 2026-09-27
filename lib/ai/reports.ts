import type { Facility, MembershipTier, Member, Program, Transaction } from "@/data/types";
import type { ClassBooking, MembershipPurchase } from "@/lib/resident/types";
import { formatCents } from "@/lib/format";
import type { StaffFilters } from "@/lib/staff/types";
import {
  buildTransactionRows,
  computeCapacityAlerts,
  computeMembershipsByPark,
  computeMonthOverMonth,
  computeRevenueByMonth,
  computeTopPrograms,
  computeWaitlistSummary,
} from "@/lib/staff/metrics";
import type { IntentMatch, ReportResult } from "./types";

export interface AiDataBundle {
  programs: Program[];
  facilities: Facility[];
  members: Member[];
  tiers: MembershipTier[];
  transactions: Transaction[];
  bookings: ClassBooking[];
  membership: MembershipPurchase | null;
  today: Date;
}

function facilityName(bundle: AiDataBundle, facilityId?: string): string | null {
  if (!facilityId) return null;
  return bundle.facilities.find((f) => f.id === facilityId)?.name ?? null;
}

function dateRangeFor(rangeDays: number, today: Date): { start: string; end: string } {
  const start = new Date(today);
  start.setDate(start.getDate() - rangeDays);
  return { start: start.toISOString().slice(0, 10), end: today.toISOString().slice(0, 10) };
}

export function runReport(match: IntentMatch, bundle: AiDataBundle): ReportResult {
  switch (match.intent) {
    case "memberships_by_park":
      return runMembershipsByPark(match.params, bundle);
    case "revenue_by_month":
      return runRevenueByMonth(match.params, bundle);
    case "capacity_status":
      return runCapacityStatus(match.params, bundle);
    case "top_programs":
      return runTopPrograms(match.params, bundle);
    case "waitlist_summary":
      return runWaitlistSummary(match.params, bundle);
    case "month_over_month":
      return runMonthOverMonth(match.params, bundle);
  }
}

function runMembershipsByPark(
  params: { facilityId?: string; rangeDays?: number },
  bundle: AiDataBundle,
): ReportResult {
  const rangeDays = params.rangeDays ?? 30;
  const filters: StaffFilters = { facilityId: params.facilityId ?? "all", rangeDays: rangeDays as 30 };
  const rows = buildTransactionRows(
    bundle.transactions,
    bundle.members,
    bundle.programs,
    bundle.tiers,
    bundle.bookings,
    bundle.membership,
  );
  const byPark = computeMembershipsByPark(bundle.facilities, rows, filters, bundle.today);
  const range = dateRangeFor(rangeDays, bundle.today);
  const park = facilityName(bundle, params.facilityId);

  const total = byPark.reduce((sum, r) => sum + r.membershipsSold, 0);
  const summary = park
    ? `${total} membership${total === 1 ? "" : "s"} sold at ${park} in the last ${rangeDays} days, totaling ${formatCents(
        byPark.reduce((s, r) => s + r.revenueCents, 0),
      )}.`
    : `${total} membership${total === 1 ? "" : "s"} sold across all parks in the last ${rangeDays} days.`;

  return {
    summary,
    table: {
      headers: ["Park", "Memberships sold", "Revenue"],
      rows: byPark.map((r) => [r.park, r.membershipsSold, formatCents(r.revenueCents)]),
    },
    dataSources: [
      { name: "transactions", count: rows.filter((r) => r.type === "membership").length },
      { name: "facilities", count: bundle.facilities.length },
    ],
    dateRange: range,
    query: `SELECT home_facility AS park, COUNT(*) AS memberships_sold, SUM(amount_cents) AS revenue_cents\nFROM transactions\nWHERE type = 'membership' AND date >= '${range.start}'${
      park ? ` AND home_facility = '${park}'` : ""
    }\nGROUP BY home_facility\nORDER BY memberships_sold DESC`,
    sourceHref: `/staff/transactions?range=${rangeDays}${params.facilityId ? `&park=${params.facilityId}` : ""}`,
  };
}

function runRevenueByMonth(
  params: { facilityId?: string; rangeDays?: number },
  bundle: AiDataBundle,
): ReportResult {
  const rangeDays = params.rangeDays ?? 30;
  const filters: StaffFilters = { facilityId: params.facilityId ?? "all", rangeDays: rangeDays as 30 };
  const allRows = buildTransactionRows(
    bundle.transactions,
    bundle.members,
    bundle.programs,
    bundle.tiers,
    bundle.bookings,
    bundle.membership,
  );
  const rows = allRows.filter(
    (r) => filters.facilityId === "all" || r.facilityId === filters.facilityId || r.facilityId === undefined,
  );
  const byMonth = computeRevenueByMonth(rows, filters, bundle.today);
  const range = dateRangeFor(rangeDays, bundle.today);
  const park = facilityName(bundle, params.facilityId);

  const totalMembership = byMonth.reduce((s, m) => s + m.membershipCents, 0);
  const totalProgram = byMonth.reduce((s, m) => s + m.programCents, 0);
  const summary = `Over the last ${rangeDays} days${park ? ` at ${park}` : ""}, memberships brought in ${formatCents(
    totalMembership,
  )} and programs brought in ${formatCents(totalProgram)}, across ${byMonth.length} month${
    byMonth.length === 1 ? "" : "s"
  }.`;

  return {
    summary,
    table: {
      headers: ["Month", "Memberships", "Programs"],
      rows: byMonth.map((m) => [m.month, formatCents(m.membershipCents), formatCents(m.programCents)]),
    },
    dataSources: [{ name: "transactions", count: rows.filter((r) => r.date >= range.start).length }],
    dateRange: range,
    query: `SELECT strftime('%Y-%m', date) AS month, type, SUM(amount_cents)\nFROM transactions\nWHERE date >= '${range.start}'${
      park ? ` AND facility = '${park}'` : ""
    }\nGROUP BY month, type\nORDER BY month`,
    sourceHref: `/staff/transactions?range=${rangeDays}${params.facilityId ? `&park=${params.facilityId}` : ""}`,
  };
}

function runCapacityStatus(
  params: { facilityId?: string; capacityDirection?: "over" | "under" | "both" },
  bundle: AiDataBundle,
): ReportResult {
  const filters: StaffFilters = { facilityId: params.facilityId ?? "all", rangeDays: 30 };
  const { overCapacity, underCapacity } = computeCapacityAlerts(
    bundle.programs,
    bundle.facilities,
    bundle.bookings,
    filters,
  );
  const direction = params.capacityDirection ?? "both";
  const over = direction !== "under" ? overCapacity : [];
  const under = direction !== "over" ? underCapacity : [];
  const park = facilityName(bundle, params.facilityId);

  const parts: string[] = [];
  if (direction !== "under") parts.push(`${over.length} class${over.length === 1 ? "" : "es"} at 90%+ capacity`);
  if (direction !== "over") parts.push(`${under.length} class${under.length === 1 ? "" : "es"} under 30% full`);
  const summary = `${parts.join(" and ")}${park ? ` at ${park}` : ""}.`;

  const rows = [
    ...over.map((a) => ["Near/at capacity", a.programName, a.park, `${Math.round(a.fillRatePct)}%`]),
    ...under.map((a) => ["Under-enrolled", a.programName, a.park, `${Math.round(a.fillRatePct)}%`]),
  ];

  return {
    summary,
    table: { headers: ["Status", "Class", "Park", "Fill rate"], rows },
    dataSources: [{ name: "programs", count: bundle.programs.length }],
    dateRange: null,
    query: `SELECT name, park, ROUND(100.0 * enrolled / capacity, 1) AS fill_rate_pct\nFROM programs\nWHERE fill_rate_pct >= 90 OR fill_rate_pct <= 30${
      park ? `\nAND park = '${park}'` : ""
    }\nORDER BY fill_rate_pct DESC`,
    sourceHref: `/staff/programs?sort=enrolled&dir=desc`,
  };
}

function runTopPrograms(
  params: { facilityId?: string; topMetric?: "enrollment" | "revenue"; limit?: number },
  bundle: AiDataBundle,
): ReportResult {
  const metric = params.topMetric ?? "enrollment";
  const limit = params.limit ?? 5;
  const filters: StaffFilters = { facilityId: params.facilityId ?? "all", rangeDays: 30 };
  const rows = buildTransactionRows(
    bundle.transactions,
    bundle.members,
    bundle.programs,
    bundle.tiers,
    bundle.bookings,
    bundle.membership,
  );
  const top = computeTopPrograms(bundle.programs, bundle.facilities, rows, bundle.bookings, metric, filters, limit);
  const park = facilityName(bundle, params.facilityId);

  const summary = `Top ${top.length} program${top.length === 1 ? "" : "s"} by ${metric}${
    park ? ` at ${park}` : ""
  }: ${top
    .slice(0, 3)
    .map((p) => p.programName)
    .join(", ")}${top.length > 3 ? ", …" : ""}.`;

  return {
    summary,
    table: {
      headers: ["Program", "Park", "Enrolled", "Revenue"],
      rows: top.map((p) => [p.programName, p.park, p.enrolled, formatCents(p.revenueCents)]),
    },
    dataSources: [
      { name: "programs", count: bundle.programs.length },
      { name: "transactions", count: rows.length },
    ],
    dateRange: null,
    query: `SELECT name, park, enrolled, revenue_cents\nFROM programs\n${
      park ? `WHERE park = '${park}'\n` : ""
    }ORDER BY ${metric === "enrollment" ? "enrolled" : "revenue_cents"} DESC\nLIMIT ${limit}`,
    sourceHref: `/staff/programs?sort=${metric === "enrollment" ? "enrolled" : "revenue"}&dir=desc`,
  };
}

function runWaitlistSummary(params: { facilityId?: string }, bundle: AiDataBundle): ReportResult {
  const filters: StaffFilters = { facilityId: params.facilityId ?? "all", rangeDays: 30 };
  const summaryRows = computeWaitlistSummary(bundle.programs, bundle.facilities, bundle.bookings, filters);
  const park = facilityName(bundle, params.facilityId);
  const totalWaitlisted = summaryRows.reduce((s, r) => s + r.waitlistCount, 0);

  const summary =
    summaryRows.length === 0
      ? `No residents are currently waitlisted${park ? ` at ${park}` : ""}.`
      : `${totalWaitlisted} resident${totalWaitlisted === 1 ? " is" : "s are"} waitlisted across ${
          summaryRows.length
        } class${summaryRows.length === 1 ? "" : "es"}${park ? ` at ${park}` : ""}.`;

  return {
    summary,
    table: {
      headers: ["Class", "Park", "Schedule", "Waitlisted"],
      rows: summaryRows.map((r) => [r.programName, r.park, r.schedule, r.waitlistCount]),
    },
    dataSources: [{ name: "bookings (session)", count: bundle.bookings.length }],
    dateRange: null,
    query: `SELECT program_name, park, COUNT(*) AS waitlisted\nFROM bookings\nWHERE status = 'waitlisted'${
      park ? ` AND park = '${park}'` : ""
    }\nGROUP BY program_id\nORDER BY waitlisted DESC`,
    sourceHref: `/staff/programs?sort=waitlist&dir=desc`,
  };
}

function runMonthOverMonth(
  params: { trendMetric?: "revenue" | "enrollments" | "memberships" },
  bundle: AiDataBundle,
): ReportResult {
  const metric = params.trendMetric ?? "revenue";
  const rows = buildTransactionRows(
    bundle.transactions,
    bundle.members,
    bundle.programs,
    bundle.tiers,
    bundle.bookings,
    bundle.membership,
  );
  const result = computeMonthOverMonth(rows, metric, bundle.today);

  const formatValue = (v: number) => (metric === "revenue" ? formatCents(v) : String(v));
  const changeText =
    result.pctChange === null
      ? "no comparable data for the prior month"
      : `${result.pctChange >= 0 ? "up" : "down"} ${Math.abs(Math.round(result.pctChange))}%`;

  const metricLabel = metric === "revenue" ? "Revenue" : metric === "enrollments" ? "Enrollments" : "Memberships";
  const summary = `${metricLabel} in ${result.currentMonthLabel} was ${formatValue(result.currentValue)}, ${changeText} from ${formatValue(
    result.previousValue,
  )} in ${result.previousMonthLabel}.`;

  return {
    summary,
    table: {
      headers: ["Month", metricLabel],
      rows: [
        [result.previousMonthLabel, formatValue(result.previousValue)],
        [result.currentMonthLabel, formatValue(result.currentValue)],
      ],
    },
    dataSources: [{ name: "transactions", count: rows.length }],
    dateRange: null,
    query: `SELECT strftime('%Y-%m', date) AS month, ${
      metric === "revenue" ? "SUM(amount_cents)" : `COUNT(*) FILTER (WHERE type = '${
        metric === "enrollments" ? "enrollment" : "membership"
      }')`
    } AS value\nFROM transactions\nWHERE month IN ('current', 'previous')\nGROUP BY month`,
    sourceHref: `/staff/transactions?range=90`,
  };
}
