// AI provider abstraction for the "Ask the data" reporting assistant.
//
// Core design principle (do not weaken this): the provider ONLY interprets a
// question into an intent + parameters. It never sees raw data and never
// computes a number — that happens in lib/ai/reports.ts, over lib/data and
// session state. This keeps every answer auditable: whatever the model
// (real or mock) picks, the actual figures always come from the same code
// path the Staff dashboard uses.
//
// Selected by env var AI_PROVIDER ("mock" | "anthropic"), default "mock".

import { matchIntent, SUPPORTED_QUESTIONS_HELP } from "./intent-matcher";
import type { ReportCatalog } from "./intent-catalog";
import type { InterpretResult } from "./types";

export interface AIProvider {
  readonly name: string;

  /**
   * DATA MINIMIZATION BOUNDARY — Henrico RFP AI clause, items 5, 9, 10.
   *
   * This method's only inputs are the staff member's raw question text and
   * `catalog`, the fixed list of supported report intents and their
   * parameter schemas (built by `buildReportIntentCatalog`, which includes
   * only public park id/name pairs as enum values). There is no parameter
   * through which resident records, resident or staff names, payment data,
   * or computed query results could reach the provider — real or mock. The
   * provider picks an intent + parameters; `lib/ai/reports.ts` is the only
   * code that ever touches actual county data to compute an answer.
   *
   * Do not widen this signature to accept `lib/data` results, session state,
   * or anything shaped like a resident/member/transaction record.
   */
  interpretQuestion(question: string, catalog: ReportCatalog): Promise<InterpretResult>;
}

export class MockProvider implements AIProvider {
  readonly name = "mock";

  async interpretQuestion(question: string, catalog: ReportCatalog): Promise<InterpretResult> {
    const match = matchIntent(question, catalog);
    if (!match) {
      return {
        match: null,
        providerName: this.name,
        reason: `I can't answer that one yet — I don't want to guess. Here's what I can help with: ${SUPPORTED_QUESTIONS_HELP}.`,
      };
    }
    return { match, providerName: this.name };
  }
}

// TODO(real backend): Wire up an actual Anthropic-backed provider. The model
// NEVER computes report numbers — it only ever picks the `run_report` tool
// and its parameters. lib/ai/reports.ts::runReport still does 100% of the
// math, exactly as MockProvider's caller does today, so switching providers
// changes nothing about correctness or auditability.
//
// Steps to implement:
// 1. `npm install @anthropic-ai/sdk`.
// 2. Read the API key from `process.env.ANTHROPIC_API_KEY` (set via
//    `vercel env add ANTHROPIC_API_KEY`); throw a clear error at
//    construction time if it's missing.
// 3. Build that request's tool schema from `catalog` (the `facilityId`
//    parameter's `options` give you its enum + descriptions) rather than the
//    static RUN_REPORT_TOOL below — RUN_REPORT_TOOL is a shape reference,
//    not something to send verbatim, since the real facility list changes.
//    Preserve the data-minimization boundary here too: only `question` and
//    values already present in `catalog` may go into the request.
// 4. Call `client.messages.create({ model: this.model, system: SYSTEM_PROMPT,
//    tools: [<the catalog-derived tool>], tool_choice: { type: "tool", name:
//    "run_report" }, messages: [{ role: "user", content: question }] })`.
// 5. Read the tool_use block's `input` off the response — that's your
//    `{ intent, ...params }`. Validate it against the same `ReportIntent`
//    union used by the mock matcher, then return `{ match: { intent, params,
//    matchedOn: "anthropic tool call" }, providerName: this.name }`.
// 6. If the model declines to call the tool (it judged the question
//    unsupported), surface its text response as `reason` instead — still no
//    fabricated numbers, since only `runReport` ever produces figures.

export const SYSTEM_PROMPT = `You are a reporting assistant for Henrico County Recreation & Parks staff.

You are never given resident records, resident or staff names, payment data,
or query results — only the staff member's question text and the schema of
supported reports. You never state a number yourself. Your only job is to
read the staff member's question and call the "run_report" tool with the
report intent and parameters that best match it. The application code runs
the actual report against the county's data and returns the figures — you
never see them and never invent them.

If the question doesn't clearly match one of the supported report intents,
do not call the tool. Instead, reply in plain text that you can't answer it
and list the kinds of questions you can help with.`;

export const RUN_REPORT_TOOL = {
  name: "run_report",
  description:
    "Run one of Henrico Recreation & Parks' predefined reports over county data. Choose exactly one intent and only the parameters that intent uses.",
  input_schema: {
    type: "object",
    properties: {
      intent: {
        type: "string",
        enum: [
          "memberships_by_park",
          "revenue_by_month",
          "capacity_status",
          "top_programs",
          "waitlist_summary",
          "month_over_month",
        ],
        description: "Which predefined report to run.",
      },
      facilityId: {
        type: "string",
        description:
          "Optional park/facility id filter, used by memberships_by_park, revenue_by_month, capacity_status, and top_programs.",
      },
      rangeDays: {
        type: "number",
        enum: [30, 90, 365],
        description: "Date range in days, used by memberships_by_park and revenue_by_month.",
      },
      capacityDirection: {
        type: "string",
        enum: ["over", "under", "both"],
        description: "Used by capacity_status: which side of capacity to report on.",
      },
      topMetric: {
        type: "string",
        enum: ["enrollment", "revenue"],
        description: "Used by top_programs: rank by enrollment count or revenue.",
      },
      trendMetric: {
        type: "string",
        enum: ["revenue", "enrollments", "memberships"],
        description: "Used by month_over_month: which metric to compare month over month.",
      },
      limit: {
        type: "number",
        description: "Used by top_programs: how many programs to return (default 5).",
      },
    },
    required: ["intent"],
  },
} as const;

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  private readonly model = process.env.AI_MODEL ?? "claude-sonnet-5";

  async interpretQuestion(_question: string, _catalog: ReportCatalog): Promise<InterpretResult> {
    void this.model;
    throw new Error(
      "AnthropicProvider is a stub. Implement it in lib/ai/provider.ts (see the TODO above) before setting AI_PROVIDER=anthropic.",
    );
  }
}

export function getAIProvider(): AIProvider {
  const selected = process.env.AI_PROVIDER ?? "mock";
  switch (selected) {
    case "anthropic":
      return new AnthropicProvider();
    case "mock":
    default:
      return new MockProvider();
  }
}
