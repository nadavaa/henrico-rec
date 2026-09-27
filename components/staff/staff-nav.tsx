"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Facility, MembershipTier, Member, Program, Transaction } from "@/data/types";
import { AskDataButton } from "./ask-data-panel";

const TABS = [
  { href: "/staff", label: "Overview" },
  { href: "/staff/programs", label: "Programs" },
  { href: "/staff/transactions", label: "Transactions" },
  { href: "/staff/ai-audit", label: "AI Audit" },
];

export function StaffNav({
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
  const pathname = usePathname();

  return (
    <nav
      aria-label="Staff dashboard sections"
      className="border-b border-slate-200 bg-white"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-2 sm:px-6">
        <ul className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive =
              tab.href === "/staff" ? pathname === "/staff" : pathname.startsWith(tab.href);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-11 items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    isActive
                      ? "border-blue-700 text-blue-700"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="py-2">
          <AskDataButton
            facilities={facilities}
            programs={programs}
            members={members}
            tiers={tiers}
            transactions={transactions}
          />
        </div>
      </div>
    </nav>
  );
}
