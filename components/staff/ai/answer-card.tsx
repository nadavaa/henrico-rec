"use client";

import { useState } from "react";
import Link from "next/link";
import type { Facility } from "@/data/types";
import type { IntentMatch, ReportIntent, ReportResult } from "@/lib/ai/types";
import type { ReviewerAction } from "@/lib/ai/audit-types";

const INTENT_LABELS: Record<ReportIntent, string> = {
  memberships_by_park: "Memberships sold by park",
  revenue_by_month: "Revenue by month",
  capacity_status: "Classes near capacity or underused",
  top_programs: "Top programs",
  waitlist_summary: "Waitlist summary by class",
  month_over_month: "Month-over-month change",
};

function formatParams(match: IntentMatch, facilities: Facility[]): string {
  const parts: string[] = [];
  const { params } = match;
  if (params.facilityId) {
    parts.push(`park = ${facilities.find((f) => f.id === params.facilityId)?.name ?? params.facilityId}`);
  }
  if (params.rangeDays) parts.push(`range = last ${params.rangeDays} days`);
  if (params.capacityDirection) parts.push(`direction = ${params.capacityDirection}`);
  if (params.topMetric) parts.push(`metric = ${params.topMetric}`);
  if (params.trendMetric) parts.push(`metric = ${params.trendMetric}`);
  if (params.limit) parts.push(`limit = ${params.limit}`);
  return parts.length > 0 ? parts.join(", ") : "(none)";
}

export function NoMatchCard({ question, reason }: { question: string; reason: string }) {
  return (
    <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-white p-4">
      <p className="rounded-md bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
        AI-generated. Verify before sharing.
      </p>
      <p className="text-slate-500">As understood: &ldquo;{question}&rdquo;</p>
      <p className="text-slate-800">{reason}</p>
    </div>
  );
}

export function AnswerCard({
  question,
  match,
  result,
  providerName,
  facilities,
  reviewerAction,
  onReview,
}: {
  question: string;
  match: IntentMatch;
  result: ReportResult;
  providerName: string;
  facilities: Facility[];
  reviewerAction: ReviewerAction;
  onReview: (action: ReviewerAction) => void;
}) {
  const [howOpen, setHowOpen] = useState(true);
  const paramsSummary = formatParams(match, facilities);

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <p className="rounded-md bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
        AI-generated. Verify before sharing.
      </p>

      <p className="text-slate-800">{result.summary}</p>

      {result.table.rows.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-slate-100">
          <table className="w-full min-w-[400px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {result.table.headers.map((h) => (
                  <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-medium text-slate-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.table.rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap px-2 py-1.5 text-slate-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onReview("verified")}
          aria-pressed={reviewerAction === "verified"}
          className={`min-h-9 rounded-md border px-3 py-1.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
            reviewerAction === "verified"
              ? "border-emerald-700 bg-emerald-700 text-white"
              : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Looks right
        </button>
        <button
          type="button"
          onClick={() => onReview("flagged")}
          aria-pressed={reviewerAction === "flagged"}
          className={`min-h-9 rounded-md border px-3 py-1.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
            reviewerAction === "flagged"
              ? "border-red-700 bg-red-700 text-white"
              : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Flag as incorrect
        </button>
        <Link
          href={result.sourceHref}
          className="flex min-h-9 items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Open source data
        </Link>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <button
          type="button"
          aria-expanded={howOpen}
          onClick={() => setHowOpen((o) => !o)}
          className="flex min-h-9 w-full items-center justify-between text-left text-sm font-semibold text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          How I got this
          <span aria-hidden="true">{howOpen ? "▲" : "▼"}</span>
        </button>

        {howOpen && (
          <div className="mt-2 space-y-3 text-xs text-slate-700">
            <div>
              <p className="font-semibold text-slate-900">Interpretation</p>
              <p>As understood: &ldquo;{question}&rdquo;</p>
              <p>Intent: {INTENT_LABELS[match.intent]}</p>
              <p>Parameters: {paramsSummary}</p>
              <p className="text-slate-500">Matched on: {match.matchedOn || "(no distinguishing keywords)"}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-900">Model routing</p>
              <p>
                {providerName === "mock"
                  ? "Demo provider: rule-based intent matching (no model call). In production, AnthropicProvider would route this question to a US-hosted Claude model, which would choose the same intent and parameters — it would still never compute the numbers itself."
                  : `Provider: ${providerName}.`}
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-900">Steps taken</p>
              <ol className="list-decimal space-y-0.5 pl-4">
                <li>Parsed the question</li>
                <li>Selected report: {INTENT_LABELS[match.intent]}</li>
                <li>Filtered data ({paramsSummary})</li>
                <li>Aggregated results</li>
                <li>Formatted the answer</li>
              </ol>
            </div>

            <div>
              <p className="font-semibold text-slate-900">Data sources</p>
              <ul className="list-disc space-y-0.5 pl-4">
                {result.dataSources.map((s) => (
                  <li key={s.name}>
                    {s.name}: {s.count} record{s.count === 1 ? "" : "s"}
                  </li>
                ))}
                {result.dateRange && (
                  <li>
                    Date range: {result.dateRange.start} to {result.dateRange.end}
                  </li>
                )}
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-900">The query</p>
              <pre className="overflow-x-auto rounded-md bg-slate-900 p-2 text-[11px] leading-relaxed text-slate-100">
                {result.query}
              </pre>
            </div>

            <p className="rounded-md bg-slate-100 px-3 py-2 font-medium text-slate-700">
              A staff member must verify before external use.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
