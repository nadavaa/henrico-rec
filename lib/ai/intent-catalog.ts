import type { ReportIntent } from "./types";

export interface ReportParamOption {
  value: string | number;
  label: string;
}

export interface ReportParameterDefinition {
  name: string;
  type: "string" | "number";
  description: string;
  enum?: (string | number)[];
  /** Value/label pairs, for parameters (like facilityId) whose values are ids. */
  options?: ReportParamOption[];
}

export interface ReportIntentDefinition {
  intent: ReportIntent;
  description: string;
  parameters: ReportParameterDefinition[];
}

export type ReportCatalog = ReportIntentDefinition[];

export interface FacilityOption {
  id: string;
  name: string;
}

/**
 * Builds the catalog handed to the AI provider. Facility id/name pairs are
 * public park metadata used only to declare valid values for the
 * `facilityId` parameter — never resident, payment, or query-result data.
 * See the data-minimization note on `AIProvider.interpretQuestion`.
 */
export function buildReportIntentCatalog(facilities: FacilityOption[]): ReportCatalog {
  const facilityParam: ReportParameterDefinition = {
    name: "facilityId",
    type: "string",
    description: "Optional park/facility filter.",
    options: facilities.map((f) => ({ value: f.id, label: f.name })),
  };
  const rangeDaysParam: ReportParameterDefinition = {
    name: "rangeDays",
    type: "number",
    description: "Date range in days.",
    enum: [30, 90, 365],
  };

  return [
    {
      intent: "memberships_by_park",
      description: "Count and revenue of memberships sold, grouped by park.",
      parameters: [facilityParam, rangeDaysParam],
    },
    {
      intent: "revenue_by_month",
      description: "Revenue by month, split between memberships and programs.",
      parameters: [facilityParam, rangeDaysParam],
    },
    {
      intent: "capacity_status",
      description: "Classes at or near capacity (90%+) or underused (under 30%).",
      parameters: [
        facilityParam,
        {
          name: "capacityDirection",
          type: "string",
          description: "Which side of capacity to report on.",
          enum: ["over", "under", "both"],
        },
      ],
    },
    {
      intent: "top_programs",
      description: "Top programs ranked by enrollment or revenue.",
      parameters: [
        facilityParam,
        {
          name: "topMetric",
          type: "string",
          description: "Rank by enrollment count or revenue.",
          enum: ["enrollment", "revenue"],
        },
        { name: "limit", type: "number", description: "How many programs to return (default 5)." },
      ],
    },
    {
      intent: "waitlist_summary",
      description: "Residents currently waitlisted, grouped by class.",
      parameters: [facilityParam],
    },
    {
      intent: "month_over_month",
      description: "This month vs. last month for a metric.",
      parameters: [
        {
          name: "trendMetric",
          type: "string",
          description: "Which metric to compare month over month.",
          enum: ["revenue", "enrollments", "memberships"],
        },
      ],
    },
  ];
}
