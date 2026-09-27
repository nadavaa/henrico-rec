"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SideSwitcher() {
  const pathname = usePathname();
  const isStaff = pathname.startsWith("/staff");
  const isResident = pathname.startsWith("/resident");

  if (!isStaff && !isResident) return null;

  return (
    <div className="flex overflow-hidden rounded-md border border-slate-300 text-sm font-medium">
      <Link
        href="/resident"
        aria-current={isResident ? "page" : undefined}
        className={`min-h-9 px-3 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
          isResident ? "bg-blue-700 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        Resident
      </Link>
      <Link
        href="/staff"
        aria-current={isStaff ? "page" : undefined}
        className={`min-h-9 border-l border-slate-300 px-3 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
          isStaff ? "bg-blue-700 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        Staff
      </Link>
    </div>
  );
}
