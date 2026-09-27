"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { getPaymentProvider } from "@/lib/payments/provider";
import { formatCents } from "@/lib/format";
import { WAIVER_TEXT } from "@/lib/resident/constants";

type WizardStep = "participant" | "waiver" | "payment" | "confirmation";

const STEP_LABELS: Record<WizardStep, string> = {
  participant: "Participant",
  waiver: "Waiver",
  payment: "Payment",
  confirmation: "Done",
};

const STEP_ORDER: WizardStep[] = ["participant", "waiver", "payment", "confirmation"];

interface BookingWizardProps<TOutcome> {
  heading: string;
  priceCents: number;
  priceSuffix: string;
  defaultParticipantName: string;
  onSubmit: (input: {
    participantName: string;
    signature: string;
    paymentId: string;
  }) => TOutcome;
  renderConfirmation: (outcome: TOutcome, participantName: string) => ReactNode;
}

export function BookingWizard<TOutcome>({
  heading,
  priceCents,
  priceSuffix,
  defaultParticipantName,
  onSubmit,
  renderConfirmation,
}: BookingWizardProps<TOutcome>) {
  const [step, setStep] = useState<WizardStep>("participant");
  const [participantName, setParticipantName] = useState(defaultParticipantName);
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState<TOutcome | null>(null);
  const signatureId = useId();
  const agreeId = useId();

  const waiverComplete = agreed && signature.trim().length > 0;
  const stepIndex = STEP_ORDER.indexOf(step);

  async function handlePay() {
    setProcessing(true);
    const result = await getPaymentProvider().charge(priceCents, heading);
    setProcessing(false);
    if (result.success) {
      const nextOutcome = onSubmit({ participantName, signature, paymentId: result.transactionId });
      setOutcome(nextOutcome);
      setStep("confirmation");
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">{heading}</h1>
      <p className="mt-1 text-slate-600">
        {formatCents(priceCents)} <span className="text-sm">{priceSuffix}</span>
      </p>

      <ol aria-label="Booking steps" className="mt-6 flex gap-2 text-xs font-medium text-slate-500">
        {STEP_ORDER.map((s, i) => (
          <li
            key={s}
            aria-current={s === step ? "step" : undefined}
            className={`flex-1 border-t-2 pt-2 ${
              i <= stepIndex ? "border-blue-700 text-blue-700" : "border-slate-200"
            }`}
          >
            {STEP_LABELS[s]}
          </li>
        ))}
      </ol>

      {step === "participant" && (
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStep("waiver");
          }}
        >
          <fieldset className="space-y-4">
            <legend className="sr-only">Participant information</legend>
            <div>
              <label htmlFor="participant-name" className="block text-sm font-medium text-slate-700">
                Participant name
              </label>
              <input
                id="participant-name"
                name="participantName"
                type="text"
                required
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              />
            </div>
          </fieldset>
          <button
            type="submit"
            className="min-h-11 w-full rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
          >
            Continue
          </button>
        </form>
      )}

      {step === "waiver" && (
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStep("payment");
          }}
        >
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-slate-900">Liability waiver</legend>
            <div
              tabIndex={0}
              className="max-h-40 overflow-y-auto whitespace-pre-line rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {WAIVER_TEXT}
            </div>
            <div className="flex items-start gap-2">
              <input
                id={agreeId}
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              />
              <label htmlFor={agreeId} className="text-sm text-slate-700">
                I have read and agree to the waiver above.
              </label>
            </div>
            <div>
              <label htmlFor={signatureId} className="block text-sm font-medium text-slate-700">
                Type your full name to sign
              </label>
              <input
                id={signatureId}
                type="text"
                required
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Full name"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              />
            </div>
          </fieldset>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("participant")}
              className="min-h-11 flex-1 rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!waiverComplete}
              className="min-h-11 flex-1 rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Continue
            </button>
          </div>
        </form>
      )}

      {step === "payment" && (
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handlePay();
          }}
        >
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-slate-900">Payment</legend>
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Demo payment — no real card is charged.
            </p>
            <div>
              <label htmlFor="card-name" className="block text-sm font-medium text-slate-700">
                Name on card
              </label>
              <input
                id="card-name"
                type="text"
                required
                defaultValue={participantName}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              />
            </div>
            <div>
              <label htmlFor="card-number" className="block text-sm font-medium text-slate-700">
                Card number
              </label>
              <input
                id="card-number"
                type="text"
                required
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                defaultValue="4242 4242 4242 4242"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="card-expiry" className="block text-sm font-medium text-slate-700">
                  Expiry
                </label>
                <input
                  id="card-expiry"
                  type="text"
                  required
                  placeholder="MM/YY"
                  defaultValue="12/29"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="card-cvc" className="block text-sm font-medium text-slate-700">
                  CVC
                </label>
                <input
                  id="card-cvc"
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="123"
                  defaultValue="123"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                />
              </div>
            </div>
          </fieldset>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("waiver")}
              disabled={processing}
              className="min-h-11 flex-1 rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={processing}
              className="min-h-11 flex-1 rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 disabled:bg-blue-400"
            >
              {processing ? "Processing…" : `Pay ${formatCents(priceCents)}`}
            </button>
          </div>
        </form>
      )}

      {step === "confirmation" && outcome !== null && (
        <div className="mt-8" aria-live="polite">
          {renderConfirmation(outcome, participantName)}
        </div>
      )}
    </div>
  );
}
