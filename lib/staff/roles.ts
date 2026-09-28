// Demo-only staff roles and the permission map behind them. There is no real
// authentication: the "current role" is session state chosen from a switcher
// (see role-context.tsx). Modeled on Attachment J's Access Control area
// (role-based permissions, least privilege).

export type StaffRole = "front_desk" | "program_manager" | "admin";

export const STAFF_ROLES: StaffRole[] = ["front_desk", "program_manager", "admin"];

export const ROLE_LABELS: Record<StaffRole, string> = {
  front_desk: "Front Desk Staff",
  program_manager: "Program Manager",
  admin: "Admin",
};

// Stand-in identity recorded in the AI audit log, one per demo role.
export const ROLE_USERS: Record<StaffRole, string> = {
  front_desk: "Demo Front Desk",
  program_manager: "Demo Program Manager",
  admin: "Demo Admin",
};

export const DEFAULT_STAFF_ROLE: StaffRole = "admin";

export type Permission =
  | "overview" // dashboard KPIs include revenue, so it is not a front-desk screen
  | "programs" // check-in / roster
  | "facilities" // facility reservations
  | "transactions"
  | "communications"
  | "ai_assistant"
  | "ai_audit";

const FRONT_DESK: Permission[] = ["programs", "facilities"];
const PROGRAM_MANAGER: Permission[] = [...FRONT_DESK, "overview", "transactions", "communications", "ai_assistant"];
const ADMIN: Permission[] = [...PROGRAM_MANAGER, "ai_audit"];

export const ROLE_PERMISSIONS: Record<StaffRole, readonly Permission[]> = {
  front_desk: FRONT_DESK,
  program_manager: PROGRAM_MANAGER,
  admin: ADMIN,
};

export function can(role: StaffRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

// Staff route -> permission required. Longest matching prefix wins.
const ROUTE_PERMISSIONS: { prefix: string; permission: Permission }[] = [
  { prefix: "/staff/programs", permission: "programs" },
  { prefix: "/staff/facilities", permission: "facilities" },
  { prefix: "/staff/transactions", permission: "transactions" },
  { prefix: "/staff/communications", permission: "communications" },
  { prefix: "/staff/ai-audit", permission: "ai_audit" },
  { prefix: "/staff", permission: "overview" },
];

export function permissionForPath(pathname: string): Permission | null {
  const hit = ROUTE_PERMISSIONS.find(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`),
  );
  return hit ? hit.permission : null;
}

export function canAccessPath(role: StaffRole, pathname: string): boolean {
  const permission = permissionForPath(pathname);
  return permission === null || can(role, permission);
}

// Where a role lands when redirected away from a page it can't open.
export function homePathForRole(role: StaffRole): string {
  return can(role, "overview") ? "/staff" : "/staff/programs";
}
