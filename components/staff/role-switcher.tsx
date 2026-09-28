"use client";

import { useId } from "react";
import { useStaffRole } from "@/lib/staff/role-context";
import { ROLE_LABELS, STAFF_ROLES, type StaffRole } from "@/lib/staff/roles";

export function RoleSwitcher() {
  const { role, setRole } = useStaffRole();
  const id = useId();

  return (
    <div className="flex items-center gap-2 text-xs">
      <label htmlFor={id} className="font-medium text-amber-900">
        Demo-only role switcher
      </label>
      <select
        id={id}
        value={role}
        onChange={(e) => setRole(e.target.value as StaffRole)}
        className="min-h-9 rounded-md border border-amber-300 bg-white px-2 py-1 text-sm text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        {STAFF_ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
    </div>
  );
}
