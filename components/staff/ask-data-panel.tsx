"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Facility, MembershipTier, Member, Program, Transaction } from "@/data/types";
import { useResidentSession } from "@/lib/resident/session-context";
import { useAiAudit } from "@/lib/ai/audit-context";
import { getAIProvider } from "@/lib/ai/provider";
import { runReport } from "@/lib/ai/reports";
import type { IntentMatch, ReportResult } from "@/lib/ai/types";
import type { ReviewerAction } from "@/lib/ai/audit-types";
import { AnswerCard, NoMatchCard } from "./ai/answer-card";

const SUGGESTED_QUESTIONS = [
  "How many memberships were sold by park this month?",
  "What's our revenue by month, memberships vs programs?",
  "Which classes are near capacity or underused?",
  "What are our top programs by enrollment?",
  "Give me a waitlist summary by class",
  "How does this month's revenue compare to last month?",
];

type AnswerState =
  | { kind: "loading"; question: string }
  | {
      kind: "match";
      question: string;
      match: IntentMatch;
      result: ReportResult;
      providerName: string;
      auditId: string;
      reviewerAction: ReviewerAction;
    }
  | { kind: "nomatch"; question: string; reason: string; auditId: string };

export function AskDataButton({
  facilities,
  programs,
  members,
  tiers,
  transactions,
}: {
  facilities: Facility[];
  programs: Program[];
  members: Member[];
  tiers: MembershipTier[];
  transactions: Transaction[];
}) {
  const [open, setOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [answer, setAnswer] = useState<AnswerState | null>(null);

  const { bookings, membership } = useResidentSession();
  const { logQuestion, setReviewerAction } = useAiAudit();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputId = useId();
  const headingId = useId();

  // A native <dialog> opened with showModal() gives us a real focus trap and
  // makes the rest of the page genuinely inert to assistive tech (not just
  // visually dimmed) — for free, from the browser, instead of a hand-rolled
  // Tab-cycling handler that only covers keyboard users.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>(`#${CSS.escape(inputId)}`)?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, inputId]);

  // Native dialogs fire "close" for both our explicit close() calls and the
  // browser's own Escape handling — keep `open` state in sync either way.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function handleClose() {
      setOpen(false);
      triggerRef.current?.focus();
    }
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  function closePanel() {
    setOpen(false);
  }

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    setAnswer({ kind: "loading", question: trimmed });

    const provider = getAIProvider();
    const interpretation = await provider.interpretQuestion(trimmed, { facilities });

    if (!interpretation.match) {
      const auditId = logQuestion({
        question: trimmed,
        intent: null,
        provider: interpretation.providerName,
        dataSources: [],
      });
      setAnswer({
        kind: "nomatch",
        question: trimmed,
        reason: interpretation.reason ?? "I couldn't match that to a supported report.",
        auditId,
      });
      return;
    }

    const result = runReport(interpretation.match, {
      programs,
      facilities,
      members,
      tiers,
      transactions,
      bookings,
      membership,
      today: new Date(),
    });

    const auditId = logQuestion({
      question: trimmed,
      intent: interpretation.match.intent,
      provider: interpretation.providerName,
      dataSources: result.dataSources.map((d) => d.name),
    });

    setAnswer({
      kind: "match",
      question: trimmed,
      match: interpretation.match,
      result,
      providerName: interpretation.providerName,
      auditId,
      reviewerAction: "none",
    });
  }

  function handleReview(action: ReviewerAction) {
    if (answer?.kind !== "match") return;
    setReviewerAction(answer.auditId, action);
    setAnswer({ ...answer, reviewerAction: action });
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-9 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        Ask the data
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        onClose={closePanel}
        onClick={(e) => {
          // A click that lands on the dialog element itself (rather than the
          // content wrapper inside it) means the user clicked the backdrop.
          if (e.target === dialogRef.current) closePanel();
        }}
        onCancel={closePanel}
        className="fixed inset-y-0 left-auto right-0 m-0 h-full max-h-none w-full max-w-md rounded-none bg-transparent p-0 [&::backdrop]:bg-black/30"
      >
        <div className="flex h-full flex-col overflow-y-auto bg-white p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 id={headingId} className="text-lg font-semibold text-slate-900">
              AI reporting assistant
            </h2>
            <button
              type="button"
              onClick={closePanel}
              className="min-h-9 min-w-9 rounded-md text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <span aria-hidden="true">✕</span>
              <span className="sr-only">Close</span>
            </button>
          </div>

          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              ask(questionText);
            }}
          >
            <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
              Ask a question about the data
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id={inputId}
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. Which classes are near capacity?"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              />
              <button
                type="submit"
                className="min-h-11 shrink-0 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
              >
                Ask
              </button>
            </div>
          </form>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Suggested questions
            </p>
            <ul className="mt-2 space-y-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuestionText(q);
                      ask(q);
                    }}
                    className="min-h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div aria-live="polite">
            {answer?.kind === "loading" && <p className="mt-4 text-sm text-slate-500">Thinking…</p>}
            {answer?.kind === "nomatch" && (
              <NoMatchCard question={answer.question} reason={answer.reason} />
            )}
            {answer?.kind === "match" && (
              <AnswerCard
                question={answer.question}
                match={answer.match}
                result={answer.result}
                providerName={answer.providerName}
                facilities={facilities}
                reviewerAction={answer.reviewerAction}
                onReview={handleReview}
              />
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
