import { getFacilities, getPrograms, getTransactions } from "@/lib/data";
import { ProgramsTable } from "@/components/staff/programs-table";

export default async function StaffProgramsPage() {
  const [programs, facilities, transactions] = await Promise.all([
    getPrograms(),
    getFacilities(),
    getTransactions(),
  ]);

  return <ProgramsTable programs={programs} facilities={facilities} transactions={transactions} />;
}
