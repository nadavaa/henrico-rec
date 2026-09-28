# Henrico Recreation & Parks — Demo

A demo Recreation Management Software System built for a Henrico County (VA)
Recreation and Parks RFP walkthrough. **This is a demo, not a production
system**: there is no real database, no real payments, and no real AI
backend. Everything runs from static, synthetic seed data so the app can be
reviewed and deployed with zero configuration and no API keys.

## Stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- Deployed on [Vercel](https://vercel.com/)

Dependencies are kept intentionally minimal — no state management library, no
database client, no UI kit beyond Tailwind.

## Running locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # ESLint
```

No environment variables or API keys are required to run or deploy this demo.

## Project structure

- `app/` — routes. `/` is the landing page with **Resident** and **Staff**
  entry points.
  - `app/resident/` — browse/filter programs, a 3-step booking flow
    (participant → waiver → mock checkout) that confirms or waitlists based
    on live capacity, membership purchase, and an account page with
    cancellable bookings and a digital membership card (QR code).
  - `app/staff/` — an overview dashboard (KPIs, charts, capacity alerts), a
    sortable programs table with roster/check-in, a transactions table with
    CSV export, an "Ask the data" AI reporting assistant, and an AI audit log.
- `data/seed.ts` — all synthetic demo data (facilities, programs, membership
  tiers, members, transactions), generated with a seeded random number
  generator so it's identical on every run.
- `lib/data/` — the data access layer. Pages call functions like
  `getPrograms()` here rather than importing `data/seed.ts` directly; a real
  database would replace the contents of this folder without changing any
  caller.
- `lib/resident/` — the resident session (bookings, membership) as a React
  context mounted at the root layout, so it's shared with the Staff side.
- `lib/staff/` — pure aggregation functions (KPIs, charts, capacity alerts,
  transaction rows) over `lib/data` + the resident session. Both the Staff
  dashboard and the AI assistant call these same functions, so their numbers
  can never disagree.
- `lib/ai/` — the "Ask the data" reporting assistant.
  - `lib/ai/intent-catalog.ts` — the fixed list of 6 report intents and their
    parameter schemas (the *only* form in which facility data reaches the
    provider: public park id/name pairs as enum values, never a raw
    `Facility` record).
  - `lib/ai/intent-matcher.ts` — turns a question + catalog into one of the 6
    report intents + parameters (keyword/regex matching today).
  - `lib/ai/reports.ts` — runs a matched intent against `lib/staff/metrics.ts`
    and returns the answer, a table, and a full trace (data sources, date
    range, a SQL-style query) for the "How I got this" panel.
  - `lib/ai/provider.ts` — `AIProvider` interface. The provider **only**
    interprets a question into an intent; it never computes or sees a
    number, and its `interpretQuestion` signature makes it structurally
    impossible to pass it resident records, names, payment data, or query
    results (see the data-minimization note in that file).
  - `lib/ai/audit-context.tsx` — the session's AI audit log (also mounted at
    the root layout).
- `lib/payments/provider.ts` — a `PaymentProvider` interface for the
  checkout flow.
- `components/` — shared UI, including the header with the "Demo mode"
  badge and the Resident/Staff switcher.

## Demo data

Generated in `data/seed.ts`:

- 5 facilities (Tuckahoe Park, Deep Run Park, Dorey Park, Belmont Rec Center,
  Hidden Creek)
- 20 programs/classes across fitness, yoga, youth sports, art, and senior
  wellness, each with a schedule, capacity, current enrollment, and price
- 3 membership tiers (Individual, Family, Senior)
- 200 members
- ~12 months of membership and program-enrollment transaction history

## Session state

Bookings, membership purchases, and the AI audit log all live in React
context at the root layout — there's no database and no login. That means
they survive navigation anywhere in the app, but reset on a hard page
reload. The demo resident is always "Alex Rivera"; the staff identity in the
AI audit log follows the demo role switcher (e.g. "Demo Admin").

## Demo-only staff role switcher (no real authentication)

The Staff header has a **demo-only role switcher** (Front Desk Staff, Program
Manager, Admin) so you can demo least-privilege views without a login system.
The role is React context state (`lib/staff/role-context.tsx`, permissions in
`lib/staff/roles.ts`) that resets to Admin on reload. Nav links are filtered by
role and `RoleGate` blocks direct navigation to pages a role can't open. Every
time the AI assistant is opened or asked a question, the role is recorded in
the AI audit log. Front Desk sees Programs/roster and Facilities only;
Program Manager adds Overview (it shows revenue), Transactions, Communications,
and the assistant; Admin adds the AI Audit log.

A real implementation would need SSO/AD/SAML per RFP Attachment J,
session-based authentication, and **server-side enforcement** of permissions
(on routes, data access, and the audit log) — this demo's gating is
client-side only and is not a security control.

## AI reporting assistant ("Ask the data")

Core design principle: **the AI interprets the question, the code computes
the answer.** `MockProvider` (active today, no API key) only maps a question
to one of 6 report intents + parameters using keyword/regex matching
(`lib/ai/intent-matcher.ts`). The actual numbers always come from
`lib/ai/reports.ts` calling the same `lib/staff/metrics.ts` functions the
Staff dashboard uses — the model (real or mock) never sees or states a
number itself. If a question doesn't match a supported intent, the assistant
says so honestly and lists what it can answer; it never guesses.

Every question asked is logged to the session's AI audit log
(`/staff/ai-audit`) with the question, matched intent, provider, data
sources read, and a reviewer action ("Looks right" / "Flag as incorrect").

**Data minimization:** the provider (mock or real) receives only the
question text and the report-intent catalog (intents + parameter schemas,
including public park id/name pairs) — never resident records, resident or
staff names, payment data, or computed query results. This is enforced by
`AIProvider.interpretQuestion`'s type signature, not just by convention. The
"How I got this" panel states this on every answer.

## Making it real

Every external dependency this demo would need in production is hidden
behind a small interface, with only a mock implementation wired up today.
Replacing a placeholder means swapping the implementation behind its
interface — callers shouldn't need to change.

| Placeholder | File | What replacing it involves |
| --- | --- | --- |
| `MockProvider` (AI) | `lib/ai/provider.ts` | See "Wiring up AnthropicProvider" below. |
| Seed data (`data/seed.ts`) via `lib/data/` | `lib/data/*.ts` | Stand up Postgres (e.g. Vercel Postgres via the Marketplace, or Supabase), write migrations for `facilities`, `programs`, `membership_tiers`, `members`, `transactions`, and replace each function body in `lib/data/` with a real query. Route/page code doesn't change. |
| `MockPaymentProvider` | `lib/payments/provider.ts` | Integrate a real processor (e.g. Stripe), implement `charge()` against it, and add its secret key via `vercel env add`. No payments are processed today — this is a stub only. |
| Auth (not yet implemented) | `lib/staff/role-context.tsx` | Replace the demo role switcher with real SSO/AD/SAML-backed sessions and enforce roles server-side. |
| Session state (React context) | `lib/resident/session-context.tsx`, `lib/ai/audit-context.tsx` | Replace with real persistence (a database + login) once auth exists, so bookings and the audit log survive beyond one browser session. |

### Wiring up AnthropicProvider

`lib/ai/provider.ts` already contains the system prompt and the `run_report`
tool definition the real model would use — `AnthropicProvider.interpretQuestion`
is the only stubbed method. To make it real:

1. `npm install @anthropic-ai/sdk`.
2. In Vercel: `vercel env add ANTHROPIC_API_KEY`, then set `AI_PROVIDER=anthropic`
   and (optionally) `AI_MODEL=claude-sonnet-5` (or another Claude model —
   `AnthropicProvider` reads this env var; it defaults to `claude-sonnet-5`).
3. Implement the TODOs in `AnthropicProvider.interpretQuestion`: call
   `client.messages.create({ model, system: SYSTEM_PROMPT, tools:
   [RUN_REPORT_TOOL], tool_choice: { type: "tool", name: "run_report" },
   messages: [{ role: "user", content: question }] })`, then read the
   `intent` + parameters off the returned tool-use block.
4. Nothing else changes. `lib/ai/reports.ts` still computes every number,
   exactly as it does for `MockProvider` — the model only ever chooses which
   report to run.

`AnthropicProvider` is never constructed unless `AI_PROVIDER=anthropic`
(see `getAIProvider()`), so this demo runs with zero API keys by default.

### Choosing a real AI provider

`AIProvider` is an interface, not a commitment to one vendor or hosting
model. Three options the County could choose between, in increasing order
of operational control (and cost/complexity):

1. **Hosted model via API** — call a provider's API directly (e.g. the
   Anthropic API), as `AnthropicProvider` is scaffolded to do. Fastest to
   stand up; the request/response for each question leaves County
   infrastructure over the network.
2. **Model deployed in the County's own US cloud account** — the same
   model, run through a managed offering inside a County-owned cloud
   account in a US region (e.g. AWS Bedrock, Google Cloud Vertex AI, or
   Azure AI Foundry), so inference traffic never leaves County-controlled
   infrastructure. Same `AIProvider` interface; only the SDK/client inside
   `AnthropicProvider` (or a renamed equivalent) changes.
3. **Self-hosted, US-developed open-weight model** — run entirely on
   infrastructure the County operates, with no external API calls at all.
   Highest control and highest operational overhead (hosting, scaling,
   evaluation all become the County's responsibility).

Any of these must be reviewed and approved by County IT under the RFP's AI
clause before use. Regardless of hosting model, **models not developed in
the United States are prohibited.**

A small **Demo mode** badge in the header is a reminder, in the UI itself,
that none of the above is wired to anything real yet.
