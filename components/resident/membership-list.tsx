"use client";

import Link from "next/link";
import type { MembershipTier } from "@/data/types";
import { formatCents } from "@/lib/format";
import { useResidentSession } from "@/lib/resident/session-context";

export function MembershipList({ tiers }: { tiers: MembershipTier[] }) {
  const { membership } = useResidentSession();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Memberships</h1>
      <p className="mt-1 text-slate-600">
        Join for facility access and discounts on programs.
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiers.map((tier) => {
          const isCurrent = membership?.tierId === tier.id;
          return (
            <li
              key={tier.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="text-lg font-semibold text-slate-900">{tier.name}</span>
              <span className="text-2xl font-bold text-slate-900">
                {formatCents(tier.monthlyPriceCents)}
                <span className="text-sm font-normal text-slate-500"> / month</span>
              </span>
              <span className="text-sm text-slate-500">
                or {formatCents(tier.annualPriceCents)} / year
              </span>
              <p className="text-sm text-slate-600">{tier.description}</p>
              <ul className="flex-1 space-y-1 text-sm text-slate-700">
                {tier.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-2">
                    <span aria-hidden="true">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <span className="mt-2 flex min-h-11 items-center justify-center rounded-md bg-emerald-100 px-4 py-2 font-medium text-emerald-800">
                  Current plan
                </span>
              ) : (
                <Link
                  href={`/resident/memberships/${tier.id}/purchase`}
                  className="mt-2 flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
                >
                  Choose plan
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
