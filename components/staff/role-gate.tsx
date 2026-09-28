"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStaffRole } from "@/lib/staff/role-context";
import { canAccessPath, homePathForRole } from "@/lib/staff/roles";

// Route-level check: children are never rendered for a role that lacks the
// page's permission, so direct navigation (typing the URL) is blocked too —
// not just hidden nav. Client-side only in this demo; see README.
export function RoleGate({ children }: { children: React.ReactNode }) {
  const { role, roleLabel } = useStaffRole();
  const pathname = usePathname();
  const router = useRouter();
  const allowed = canAccessPath(role, pathname);
  const home = homePathForRole(role);

  useEffect(() => {
    if (!allowed) router.replace(home);
  }, [allowed, home, router]);

  if (allowed) return <>{children}</>;

  return (
    <div role="alert" className="mx-auto w-full max-w-2xl px-4 py-12 text-center sm:px-6">
      <h1 className="text-xl font-bold text-slate-900">Access restricted</h1>
      <p className="mt-2 text-slate-600">
        The {roleLabel} role doesn&rsquo;t have permission to view this page. Redirecting you to a
        page your role can open…
      </p>
      <Link href={home} className="mt-4 inline-block text-sm font-medium text-blue-700 underline">
        Go there now
      </Link>
    </div>
  );
}
