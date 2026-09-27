import { getFacilities, getMembers, getMembershipTiers, getPrograms, getTransactions } from "@/lib/data";
import { TransactionsTable } from "@/components/staff/transactions-table";

export default async function StaffTransactionsPage() {
  const [transactions, members, programs, tiers, facilities] = await Promise.all([
    getTransactions(),
    getMembers(),
    getPrograms(),
    getMembershipTiers(),
    getFacilities(),
  ]);

  return (
    <TransactionsTable
      transactions={transactions}
      members={members}
      programs={programs}
      tiers={tiers}
      facilities={facilities}
    />
  );
}
