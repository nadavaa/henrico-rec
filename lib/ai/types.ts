import type { DateRangeDays } from "@/lib/staff/types";

export type ReportIntent =
  | "memberships_by_park"
  | "revenue_by_month"
  | "capacity_status"
  | "top_programs"
  | "waitlist_summary"
  | "month_over_month";

export type CapacityDirection = "over" | "under" | "both";
export type TopMetric = "enrollment" | "revenue";
export type TrendMetric = "revenue" | "enrollments" | "memberships";

export interface IntentParams {
  facilityId?: string;
  rangeDays?: DateRangeDays;
  capacityDirection?: CapacityDirection;
  topMetric?: TopMetric;
  trendMetric?: TrendMetric;
  limit?: number;
}

export interface IntentMatch {
  intent: ReportIntent;
  params: IntentParams;
  /** Short human-readable trace of what in the question triggered this match. */
  matchedOn: string;
}

export interface ReportTable {
  headers: string[];
  rows: (string | number)[][];
}

export interface ReportResult {
  summary: string;
  table: ReportTable;
  dataSources: { name: string; count: number }[];
  dateRange: { start: string; end: string } | null;
  /** SQL-style pseudo-query representing the computation, for transparency. */
  query: string;
  /** Where "Open source data" should send staff to see the underlying rows. */
  sourceHref: string;
}

export interface InterpretResult {
  match: IntentMatch | null;
  /** Present (and only present) when match is null: an honest explanation. */
  reason?: string;
  providerName: string;
}
