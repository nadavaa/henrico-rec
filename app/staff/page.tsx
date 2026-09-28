import {
  getFacilities,
  getMembers,
  getMembershipTiers,
  getPrograms,
  getReservableSpaces,
  getTransactions,
} from "@/lib/data";
import { StaffOverview } from "@/components/staff/staff-overview";

export default async function StaffOverviewPage() {
  const [programs, facilities, members, tiers, transactions, spaces] = await Promise.all([
    getPrograms(),
    getFacilities(),
    getMembers(),
    getMembershipTiers(),
    getTransactions(),
    getReservableSpaces(),
  ]);

  return (
    <StaffOverview
      programs={programs}
      facilities={facilities}
      members={members}
      tiers={tiers}
      transactions={transactions}
      spaces={spaces}
    />
  );
}
