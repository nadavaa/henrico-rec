import { Suspense } from "react";
import {
  getFacilities,
  getMembers,
  getMembershipTiers,
  getPrograms,
  getReservableSpaces,
  getTransactions,
} from "@/lib/data";
import { TransactionsTable } from "@/components/staff/transactions-table";

export default async function StaffTransactionsPage() {
  const [transactions, members, programs, tiers, facilities, spaces] = await Promise.all([
    getTransactions(),
    getMembers(),
    getPrograms(),
    getMembershipTiers(),
    getFacilities(),
    getReservableSpaces(),
  ]);

  return (
    <Suspense>
      <TransactionsTable
        transactions={transactions}
        members={members}
        programs={programs}
        tiers={tiers}
        facilities={facilities}
        spaces={spaces}
      />
    </Suspense>
  );
}
