"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/resident", label: "Programs" },
  { href: "/resident/memberships", label: "Memberships" },
  { href: "/resident/account", label: "My Account" },
];

export function ResidentNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Resident portal sections" className="border-b border-slate-200 bg-white">
      <ul className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2 sm:px-6">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/resident" ? pathname === "/resident" : pathname.startsWith(tab.href);
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
    </nav>
  );
}
