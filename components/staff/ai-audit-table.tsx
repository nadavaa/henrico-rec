"use client";

import { useAiAudit } from "@/lib/ai/audit-context";
import { ROLE_LABELS, STAFF_ROLES } from "@/lib/staff/roles";

const INTENT_LABELS: Record<string, string> = {
  memberships_by_park: "Memberships sold by park",
  revenue_by_month: "Revenue by month",
  capacity_status: "Classes near capacity or underused",
  top_programs: "Top programs",
  waitlist_summary: "Waitlist summary by class",
  month_over_month: "Month-over-month change",
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AiAuditTable() {
  const { entries } = useAiAudit();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">AI Audit Log</h1>
      <p className="mt-2 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-900">
        County data stays in county systems and is never used to train AI models. All AI activity is
        logged and visible to the County.
      </p>

      <p className="mt-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
        Access to AI-assisted outputs is logged and attributed to a role, not just a question —
        mirroring the RFP&rsquo;s logged, justified access to eyes-off data (Section VIII.C).
      </p>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STAFF_ROLES.map((r) => {
          const roleEntries = entries.filter((e) => e.role === r);
          const opens = roleEntries.filter((e) => e.eventType === "access").length;
          const questions = roleEntries.length - opens;
          return (
            <div key={r} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <dt className="text-sm font-medium text-slate-900">{ROLE_LABELS[r]}</dt>
              <dd className="text-sm text-slate-600">
                {opens} assistant {opens === 1 ? "open" : "opens"} · {questions}{" "}
                {questions === 1 ? "question" : "questions"}
              </dd>
            </div>
          );
        })}
      </dl>

      {entries.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
          No AI access yet this session. Try &ldquo;Ask the data&rdquo; from any staff page.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Timestamp</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Staff user</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Role</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Event</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Question</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Intent</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Provider</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Data sources</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Reviewer action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-slate-100 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                    {formatTimestamp(e.timestamp)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">{e.staffUser}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">{ROLE_LABELS[e.role]}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                    {e.eventType === "access" ? "Opened assistant" : "Asked question"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{e.question}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                    {e.intent ? INTENT_LABELS[e.intent] ?? e.intent : "Unmatched"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">{e.provider}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                    {e.dataSources.length > 0 ? e.dataSources.join(", ") : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {e.eventType === "access" ? (
                      "—"
                    ) : (
                    <span
                      className={
                        e.reviewerAction === "verified"
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                          : e.reviewerAction === "flagged"
                            ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                            : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                      }
                    >
                      {e.reviewerAction === "none" ? "Not reviewed" : e.reviewerAction}
                    </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
