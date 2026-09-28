"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Facility, MembershipTier, Member, Program, Transaction } from "@/data/types";
import { AskDataButton } from "./ask-data-panel";
import { RoleSwitcher } from "./role-switcher";
import { useStaffRole } from "@/lib/staff/role-context";
import { can, type Permission } from "@/lib/staff/roles";

const TABS: { href: string; label: string; permission: Permission }[] = [
  { href: "/staff", label: "Overview", permission: "overview" },
  { href: "/staff/programs", label: "Programs", permission: "programs" },
  { href: "/staff/facilities", label: "Facilities", permission: "facilities" },
  { href: "/staff/transactions", label: "Transactions", permission: "transactions" },
  { href: "/staff/communications", label: "Communications", permission: "communications" },
  { href: "/staff/ai-audit", label: "AI Audit", permission: "ai_audit" },
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
  const { role } = useStaffRole();
  const visibleTabs = TABS.filter((t) => can(role, t.permission));

  return (
    <nav
      aria-label="Staff dashboard sections"
      className="border-b border-slate-200 bg-white"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-2 sm:px-6">
        <ul className="flex gap-1 overflow-x-auto">
          {visibleTabs.map((tab) => {
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
        <div className="flex items-center gap-3 py-2">
          <RoleSwitcher />
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
