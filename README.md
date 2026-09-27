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
  entry points; `/resident` and `/staff` are placeholder portals for now.
- `data/seed.ts` — all synthetic demo data (facilities, programs, membership
  tiers, members, transactions), generated with a seeded random number
  generator so it's identical on every run.
- `lib/data/` — the data access layer. Pages call functions like
  `getPrograms()` here rather than importing `data/seed.ts` directly; a real
  database would replace the contents of this folder without changing any
  caller.
- `lib/ai/provider.ts` — an `AIProvider` interface behind which any future
  AI-assisted feature would sit.
- `lib/payments/provider.ts` — a `PaymentProvider` interface for any future
  registration/checkout flow.
- `components/` — shared UI, including the header with the "Demo mode"
  badge.

## Demo data

Generated in `data/seed.ts`:

- 5 facilities (Tuckahoe Park, Deep Run Park, Dorey Park, Belmont Rec Center,
  Hidden Creek)
- 20 programs/classes across fitness, yoga, youth sports, art, and senior
  wellness, each with a schedule, capacity, current enrollment, and price
- 3 membership tiers (Individual, Family, Senior)
- 200 members
- ~12 months of membership and program-enrollment transaction history

## Current phase

This is **Step 1: scaffold and shell only.** The Resident and Staff pages are
placeholders that prove the data layer works (they render live counts from
the seed data) — no registration, enrollment, or management features have
been built yet. Those come in later phases.

## Making it real

Every external dependency this demo would need in production is hidden
behind a small interface, with only a mock implementation wired up today.
Replacing a placeholder means swapping the implementation behind its
interface — callers shouldn't need to change.

| Placeholder | File | What replacing it involves |
| --- | --- | --- |
| `MockProvider` (AI) | `lib/ai/provider.ts` | Add `@anthropic-ai/sdk`, implement `AnthropicProvider.generateText` using `client.messages.create`, set `ANTHROPIC_API_KEY` via `vercel env add`, and set `AI_PROVIDER=anthropic`. |
| Seed data (`data/seed.ts`) via `lib/data/` | `lib/data/*.ts` | Stand up Postgres (e.g. Vercel Postgres via the Marketplace, or Supabase), write migrations for `facilities`, `programs`, `membership_tiers`, `members`, `transactions`, and replace each function body in `lib/data/` with a real query. Route/page code doesn't change. |
| `MockPaymentProvider` | `lib/payments/provider.ts` | Integrate a real processor (e.g. Stripe), implement `charge()` against it, and add its secret key via `vercel env add`. No payments are processed today — this is a stub only. |
| Auth (not yet implemented) | — | Add an auth provider (e.g. Auth.js, Clerk) in front of the Staff portal at minimum. |

A small **Demo mode** badge in the header is a reminder, in the UI itself,
that none of the above is wired to anything real yet.
