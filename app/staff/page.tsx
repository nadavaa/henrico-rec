import { getFacilities, getMembers, getMembershipTiers, getPrograms, getTransactions } from "@/lib/data";
import { StaffOverview } from "@/components/staff/staff-overview";

export default async function StaffOverviewPage() {
  const [programs, facilities, members, tiers, transactions] = await Promise.all([
    getPrograms(),
    getFacilities(),
    getMembers(),
    getMembershipTiers(),
    getTransactions(),
  ]);

  return (
    <StaffOverview
      programs={programs}
      facilities={facilities}
      members={members}
      tiers={tiers}
      transactions={transactions}
    />
  );
}
