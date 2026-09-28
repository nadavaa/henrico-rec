import Link from "next/link";

type Status = "Demonstrated" | "Partially demonstrated" | "Designed for" | "Roadmap";

interface CoverageRow {
  area: string;
  status: Status;
  shows: string;
  where: string;
}

// RFP No. 26-2996-8ARA, Section II.A — exact order and wording.
const FUNCTIONAL_AREAS: CoverageRow[] = [
  {
    area: "Technical and Hosting",
    status: "Partially demonstrated",
    shows: "Deployed as a live, web-based Next.js app on Vercel.",
    where: "Vercel deployment; next.config.ts",
  },
  {
    area: "Security and Compliance",
    status: "Partially demonstrated",
    shows:
      "AI data-minimization boundary, an AI audit log, and a no-training-on-County-data design; no authentication, PCI, or encryption work.",
    where: "lib/ai/provider.ts; /staff/ai-audit",
  },
  {
    area: "Membership Management",
    status: "Demonstrated",
    shows: "3 membership tiers, a purchase flow, and a digital membership card with a check-in QR code.",
    where: "/resident/memberships; /resident/account",
  },
  {
    area: "Integration and Data Exchange",
    status: "Partially demonstrated",
    shows:
      "CSV export of transactions and a swappable data-access layer for a future database or finance integration; no live external integrations.",
    where: "/staff/transactions; lib/data/",
  },
  {
    area: "Access Control",
    status: "Partially demonstrated",
    shows:
      "A scannable membership QR code and a staff-side roster check-in toggle; no door/scanner hardware integration.",
    where: "/resident/account; /staff/programs/[id]",
  },
  {
    area: "Mobile",
    status: "Demonstrated",
    shows:
      "Mobile-first Resident portal and a responsive Staff dashboard (stacking KPIs/charts, collapsing filters, scrollable tables).",
    where: "app/resident/; app/staff/",
  },
  {
    area: "Profile Setup and Account Management",
    status: "Partially demonstrated",
    shows:
      "A My Account page with bookings, waitlist positions, and the membership card; a single fixed demo resident, no sign-up, login, or family accounts.",
    where: "/resident/account; lib/resident/demo-resident.ts",
  },
  {
    area: "Administration and Controls",
    status: "Roadmap",
    shows:
      "Not in the demo: a single fixed \"Demo Staff\" user, with no roles, permissions, or configuration screens or code.",
    where: "—",
  },
  {
    area: "Financial and Payments",
    status: "Partially demonstrated",
    shows:
      "Mock checkout, a transactions table, revenue reporting, and CSV export; a real payment processor is a placeholder interface only.",
    where: "lib/payments/provider.ts; /staff/transactions",
  },
  {
    area: "Marketing and Communications",
    status: "Demonstrated",
    shows:
      "Staff can compose a message to a class roster, a facility's waitlist, or all active members, logged to a session Outbox (timestamp, audience, recipient count, subject). When a canceled booking frees a spot, the resident is auto-promoted off the waitlist, logged to the Outbox, and shown a banner in My Account — no real email/SMS is sent.",
    where: "/staff/communications; /resident/account; lib/communications/",
  },
  {
    area: "Facility and Shelters",
    status: "Demonstrated",
    shows:
      "Attachment J §11.1 (search 7 reservable picnic shelters, rooms, and a pavilion by park and capacity), §11.1 (calendar-style date + 4 time-block selection, with booked blocks marked unavailable), §11.2.3 (request → pending approval → staff approve/deny workflow, with approvals blocking the slot), and §11.3 (recurring weekly bookings, with all resulting dates shown before confirming). Approved reservations flow into Staff revenue and the transactions table.",
    where: "/resident/facilities; /staff/facilities; lib/facilities/",
  },
  {
    area: "Program and Activity",
    status: "Demonstrated",
    shows: "Browse, filter, book, capacity tracking, automatic waitlisting, and staff rosters.",
    where: "/resident (browse & book); /staff/programs",
  },
  {
    area: "Waiver and Forms",
    status: "Demonstrated",
    shows:
      "A liability waiver with a required typed signature, blocking booking or membership purchase until signed.",
    where: "components/resident/booking-wizard.tsx",
  },
  {
    area: "Reporting and Analytics",
    status: "Demonstrated",
    shows:
      "Staff KPIs and charts (each with a table view), capacity alerts, and an AI reporting assistant with full traceability.",
    where: "/staff; /staff/ai-audit; lib/staff/metrics.ts",
  },
  {
    area: "Training and Implementation",
    status: "Roadmap",
    shows:
      "Not software: addressed in the written proposal (project plan, data conversion, training and testing plans per RFP Section II.B).",
    where: "—",
  },
];

interface AiClauseRow {
  requirement: string;
  feature: string;
}

const AI_CLAUSE_MAPPING: AiClauseRow[] = [
  {
    requirement: "County data ownership",
    feature:
      "All data lives in lib/data/ (backed by seed data today, a County-owned database in production). The AI provider never stores or retains anything — it returns an intent, and the application computes the answer.",
  },
  {
    requirement: "No training on county data",
    feature:
      "MockProvider makes no external calls at all. AnthropicProvider (lib/ai/provider.ts) is scaffolded to use a provider with zero-data-retention terms — see \"Choosing a real AI provider\" in the README.",
  },
  {
    requirement: "Data minimization",
    feature:
      "AIProvider.interpretQuestion's type signature only accepts the question text and a fixed report-intent catalog — never resident records, names, payment data, or query results.",
  },
  {
    requirement: "Traceability",
    feature:
      "Every answer includes an open-by-default \"How I got this\" panel: interpretation, model routing, steps taken, data sources with record counts, and a SQL-style query.",
  },
  {
    requirement: "Human review",
    feature:
      "Every answer is labeled \"AI-generated. Verify before sharing,\" with \"Looks right\" / \"Flag as incorrect\" actions and an explicit human-oversight note.",
  },
  {
    requirement: "Audit log",
    feature:
      "Every question is logged at /staff/ai-audit with timestamp, staff user, question, intent, provider, data sources, and reviewer action.",
  },
  {
    requirement: "US-model requirement",
    feature:
      "README documents that any provider choice must be approved by County IT, and that models not developed in the United States are prohibited.",
  },
];

const STATUS_STYLES: Record<Status, string> = {
  Demonstrated: "bg-emerald-100 text-emerald-800",
  "Partially demonstrated": "bg-blue-100 text-blue-800",
  "Designed for": "bg-amber-100 text-amber-900",
  Roadmap: "bg-slate-200 text-slate-700",
};

const STATUS_ORDER: Status[] = ["Demonstrated", "Partially demonstrated", "Designed for", "Roadmap"];

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function statusCounts(rows: CoverageRow[]): { status: Status; count: number }[] {
  return STATUS_ORDER.map((status) => ({
    status,
    count: rows.filter((r) => r.status === status).length,
  })).filter((s) => s.count > 0);
}

export default function RfpCoveragePage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="text-sm font-medium text-blue-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          ← Back home
        </Link>

        <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-blue-700">
          RFP No. 26-2996-8ARA — Recreation Management Software System
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">RFP Coverage</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Mapped to the 15 functional areas in Henrico County RFP No. 26-2996-8ARA, Section II.A.
          Detailed line-item requirements (Attachment J) would be addressed in the full proposal.
        </p>
        <p className="mt-2 max-w-3xl text-slate-600">
          <strong>Demonstrated</strong> means working end to end in the demo;{" "}
          <strong>Partially demonstrated</strong> means some of it works, the rest is a placeholder;{" "}
          <strong>Designed for</strong> means the interface/placeholder exists in code with no working
          UI; <strong>Roadmap</strong> means it&apos;s not in the demo.
        </p>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">
                  #
                </th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">
                  Functional area (RFP Section II.A)
                </th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">
                  Status
                </th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">
                  What the demo shows
                </th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">
                  Where it lives
                </th>
              </tr>
            </thead>
            <tbody>
              {FUNCTIONAL_AREAS.map((row, i) => (
                <tr key={row.area} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-slate-500">{i + 1}</td>
                  <td className="whitespace-normal px-3 py-2 font-medium text-slate-900">{row.area}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-normal px-3 py-2 text-slate-600">{row.shows}</td>
                  <td className="whitespace-normal px-3 py-2 font-mono text-xs text-slate-500">
                    {row.where}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-sm text-slate-500">
          {statusCounts(FUNCTIONAL_AREAS)
            .map((s) => `${s.count} ${s.status}`)
            .join(" · ")}
          {" "}(15 total)
        </p>

        <h2 className="mt-10 text-xl font-bold text-slate-900">
          AI Clause (Section VIII.C) Coverage
        </h2>
        <p className="mt-2 max-w-3xl text-slate-600">
          The RFP&apos;s AI clause requirements, mapped to the &ldquo;Ask the data&rdquo; assistant on the
          Staff side.
        </p>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">
                  Requirement
                </th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">
                  How it&apos;s addressed
                </th>
              </tr>
            </thead>
            <tbody>
              {AI_CLAUSE_MAPPING.map((row) => (
                <tr key={row.requirement} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-900">
                    {row.requirement}
                  </td>
                  <td className="whitespace-normal px-3 py-2 text-slate-600">{row.feature}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          See the{" "}
          <Link href="/staff/ai-audit" className="font-medium text-blue-700 hover:underline">
            AI Audit Log
          </Link>{" "}
          and the README&apos;s &ldquo;Making it real&rdquo; section for further detail.
        </p>
      </div>
    </main>
  );
}
