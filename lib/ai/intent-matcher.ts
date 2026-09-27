import type { DateRangeDays } from "@/lib/staff/types";
import type { ReportCatalog, ReportParamOption } from "./intent-catalog";
import type { CapacityDirection, IntentMatch, TopMetric, TrendMetric } from "./types";

// This is the entire "AI" in MockProvider: cheap, transparent keyword/regex
// matching. It only ever chooses an intent + parameters — it never computes
// a number. AnthropicProvider (lib/ai/provider.ts) would replace this file's
// job with a real model call, but the split between "interpret" and
// "compute" stays identical either way.
//
// It only reads facility id/name pairs off the catalog it's handed (never
// the raw facilities list) — the same data-minimization boundary the
// provider itself is held to.

export const SUPPORTED_QUESTIONS_HELP = [
  "Memberships sold by park (e.g. \"How many memberships were sold at Deep Run Park?\")",
  "Revenue by month, memberships vs. programs",
  "Classes near capacity or underused",
  "Top programs by enrollment or revenue",
  "Waitlist summary by class",
  "Month-over-month change in revenue, enrollments, or memberships",
].join("; ");

function facilityOptionsFrom(catalog: ReportCatalog): ReportParamOption[] {
  for (const def of catalog) {
    const param = def.parameters.find((p) => p.name === "facilityId");
    if (param?.options) return param.options;
  }
  return [];
}

function detectFacility(text: string, facilityOptions: ReportParamOption[]): string | undefined {
  const lower = text.toLowerCase();
  const match = facilityOptions.find((f) => lower.includes(String(f.label).toLowerCase()));
  return match ? String(match.value) : undefined;
}

function detectRangeDays(text: string): DateRangeDays {
  if (/(last\s*90|last\s*quarter|three\s*months)/i.test(text)) return 90;
  if (/(this year|last\s*12\s*months|past year|annual)/i.test(text)) return 365;
  return 30;
}

function detectLimit(text: string): number {
  const match = text.match(/top\s+(\d{1,2})/i);
  if (match) return Math.min(20, Math.max(1, Number(match[1])));
  return 5;
}

export function matchIntent(question: string, catalog: ReportCatalog): IntentMatch | null {
  const q = question.trim();
  if (!q) return null;

  const facilityOptions = facilityOptionsFrom(catalog);
  const facilityId = detectFacility(q, facilityOptions);
  const facilityNote = facilityId
    ? `park="${facilityOptions.find((f) => f.value === facilityId)?.label}"`
    : "";

  // 1. Waitlist — most specific keyword, check first.
  if (/waitlist/i.test(q)) {
    return {
      intent: "waitlist_summary",
      params: { facilityId },
      matchedOn: ["keyword: \"waitlist\"", facilityNote].filter(Boolean).join(", "),
    };
  }

  // 2. Month-over-month — requires an explicit comparison-to-a-prior-month
  // phrase, not just any "vs"/"compare" (which also appears in ordinary
  // revenue-split questions like "memberships vs programs").
  const momMatch = /(month.over.month|compared?\s+to\s+(last|previous)\s+month|vs\.?\s+last\s+month|change\s+(from|since)\s+last\s+month)/i.exec(
    q,
  );
  if (momMatch) {
    let trendMetric: TrendMetric = "revenue";
    if (/enrollment/i.test(q)) trendMetric = "enrollments";
    else if (/membership/i.test(q)) trendMetric = "memberships";
    return {
      intent: "month_over_month",
      params: { trendMetric },
      matchedOn: `keyword: "${momMatch[0]}", metric=${trendMetric}`,
    };
  }

  // 3. Top / highest / most popular.
  if (/\b(top|highest|most popular|best[- ]selling)\b/i.test(q)) {
    const topMetric: TopMetric = /revenue|\$|money|income/i.test(q) ? "revenue" : "enrollment";
    return {
      intent: "top_programs",
      params: { facilityId, topMetric, limit: detectLimit(q) },
      matchedOn: ["keyword: \"top\"", `metric=${topMetric}`, facilityNote].filter(Boolean).join(", "),
    };
  }

  // 4. Capacity / underused.
  if (/(capacity|\bfull\b|underused|under[- ]enrolled|under[- ]filled|empty)/i.test(q)) {
    const mentionsUnder = /(underused|under[- ]enrolled|under[- ]filled|empty)/i.test(q);
    const mentionsOver = /(capacity|\bfull\b|near capacity)/i.test(q);
    const capacityDirection: CapacityDirection =
      mentionsUnder && mentionsOver ? "both" : mentionsUnder ? "under" : "over";
    return {
      intent: "capacity_status",
      params: { facilityId, capacityDirection },
      matchedOn: ["keyword: \"capacity\"", `direction=${capacityDirection}`, facilityNote]
        .filter(Boolean)
        .join(", "),
    };
  }

  // 5. Memberships sold by park.
  if (/membership/i.test(q) && !/revenue/i.test(q)) {
    return {
      intent: "memberships_by_park",
      params: { facilityId, rangeDays: detectRangeDays(q) },
      matchedOn: ["keyword: \"membership\"", facilityNote, `range=${detectRangeDays(q)}d`]
        .filter(Boolean)
        .join(", "),
    };
  }

  // 6. Revenue by month.
  if (/revenue/i.test(q)) {
    return {
      intent: "revenue_by_month",
      params: { facilityId, rangeDays: detectRangeDays(q) },
      matchedOn: ["keyword: \"revenue\"", facilityNote, `range=${detectRangeDays(q)}d`]
        .filter(Boolean)
        .join(", "),
    };
  }

  return null;
}
