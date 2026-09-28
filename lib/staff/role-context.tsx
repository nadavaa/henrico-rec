"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_STAFF_ROLE, ROLE_LABELS, ROLE_USERS, type StaffRole } from "./roles";

// Demo session state, same pattern as the demo resident: React context at the
// root layout, reset on hard reload. NOT authentication.
interface StaffRoleValue {
  role: StaffRole;
  roleLabel: string;
  staffUser: string;
  setRole: (role: StaffRole) => void;
}

const StaffRoleContext = createContext<StaffRoleValue | null>(null);

export function StaffRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<StaffRole>(DEFAULT_STAFF_ROLE);

  const value = useMemo<StaffRoleValue>(
    () => ({ role, roleLabel: ROLE_LABELS[role], staffUser: ROLE_USERS[role], setRole }),
    [role],
  );

  return <StaffRoleContext.Provider value={value}>{children}</StaffRoleContext.Provider>;
}

export function useStaffRole(): StaffRoleValue {
  const ctx = useContext(StaffRoleContext);
  if (!ctx) throw new Error("useStaffRole must be used within StaffRoleProvider");
  return ctx;
}
