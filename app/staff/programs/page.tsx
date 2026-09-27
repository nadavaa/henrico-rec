import { Suspense } from "react";
import { getFacilities, getMembers, getMembershipTiers, getPrograms, getTransactions } from "@/lib/data";
import { ProgramsTable } from "@/components/staff/programs-table";

export default async function StaffProgramsPage() {
  const [programs, facilities, members, tiers, transactions] = await Promise.all([
    getPrograms(),
    getFacilities(),
    getMembers(),
    getMembershipTiers(),
    getTransactions(),
  ]);

  return (
    <Suspense>
      <ProgramsTable
        programs={programs}
        facilities={facilities}
        members={members}
        tiers={tiers}
        transactions={transactions}
      />
    </Suspense>
  );
}
