import { getFacilities, getMembers, getMembershipTiers, getPrograms, getTransactions } from "@/lib/data";
import { RoleGate } from "@/components/staff/role-gate";
import { StaffNav } from "@/components/staff/staff-nav";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const [programs, facilities, members, tiers, transactions] = await Promise.all([
    getPrograms(),
    getFacilities(),
    getMembers(),
    getMembershipTiers(),
    getTransactions(),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <StaffNav
        facilities={facilities}
        programs={programs}
        members={members}
        tiers={tiers}
        transactions={transactions}
      />
      <RoleGate>{children}</RoleGate>
    </div>
  );
}
