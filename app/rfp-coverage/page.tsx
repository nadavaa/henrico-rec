import Link from "next/link";

type Status = "Demonstrated" | "Designed for" | "Roadmap";

interface CoverageRow {
  area: string;
  status: Status;
  note: string;
}

const FUNCTIONAL_AREAS: CoverageRow[] = [
  {
    area: "Resident registration & self-service accounts",
    status: "Demonstrated",
    note: "Resident portal with a fixed demo account (no login system yet).",
  },
  {
    area: "Online program & class registration",
    status: "Demonstrated",
    note: "Browse, filter, and book a class in a 3-step flow with waiver + mock checkout.",
  },
  {
    area: "Membership sales & management",
    status: "Demonstrated",
    note: "3 tiers, purchase flow, and a digital membership card with a check-in QR code.",
  },
  {
    area: "Waitlist management",
    status: "Demonstrated",
    note: "Automatic waitlisting at capacity, with position shown to the resident and staff.",
  },
  {
    area: "Facility & park directory",
    status: "Demonstrated",
    note: "5 seeded facilities with address, description, and amenities.",
  },
  {
    area: "Payment processing / POS",
    status: "Designed for",
    note: "MockPaymentProvider behind a PaymentProvider interface (lib/payments/provider.ts) — no real processor wired up.",
  },
  {
    area: "Financial reporting & reconciliation",
    status: "Demonstrated",
    note: "Revenue by month, transactions table, and CSV export on the Staff side.",
  },
  {
    area: "Facility/room/field reservations & permitting",
    status: "Roadmap",
    note: "This demo covers class/program scheduling only, not general space rental or permits.",
  },
  {
    area: "Front-desk check-in & attendance",
    status: "Demonstrated",
    note: "Per-class roster with a check-in toggle for staff.",
  },
  {
    area: "Staff administration, roles & permissions",
    status: "Designed for",
    note: "A single fixed \"Demo Staff\" user today; no login, roles, or permission system yet.",
  },
  {
    area: "Reporting, analytics & AI-assisted insights",
    status: "Demonstrated",
    note: "Staff dashboard KPIs/charts plus the \"Ask the data\" AI reporting assistant.",
  },
  {
    area: "Communications & notifications",
    status: "Roadmap",
    note: "No email/SMS reminders or waitlist notifications in this demo.",
  },
  {
    area: "Discounts, scholarships & financial assistance",
    status: "Roadmap",
    note: "Not modeled in the seed data or checkout flow.",
  },
  {
    area: "Data export & integration",
    status: "Demonstrated",
    note: "CSV export of transactions; lib/data/ is a swappable seam for a future real database or integration.",
  },
  {
    area: "Accessibility (Section 508) & mobile responsiveness",
    status: "Demonstrated",
    note: "Semantic HTML, labeled fields, visible focus states, keyboard navigation, and mobile-first layouts throughout.",
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
  "Designed for": "bg-amber-100 text-amber-900",
  Roadmap: "bg-slate-200 text-slate-700",
};

function StatusBadge({ status }: { status: Status }) {
  const label = status === "Designed for" ? "Designed for (placeholder in code)" : status;
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {label}
    </span>
  );
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
          How this demo maps to the RFP&apos;s 15 functional areas. <strong>Demonstrated</strong> means
          you can click through it right now; <strong>Designed for</strong> means the interface/seam
          exists in code with a mock behind it; <strong>Roadmap</strong> means it&apos;s out of scope for
          this demo.
        </p>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">
                  Functional area
                </th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">
                  Status
                </th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {FUNCTIONAL_AREAS.map((row) => (
                <tr key={row.area} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="whitespace-normal px-3 py-2 font-medium text-slate-900">{row.area}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-normal px-3 py-2 text-slate-600">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
