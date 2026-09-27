import { notFound } from "next/navigation";
import { getFacilityById, getMembers, getProgramById } from "@/lib/data";
import { ProgramRoster } from "@/components/staff/program-roster";

export default async function StaffProgramRosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getProgramById(id);
  if (!program) notFound();

  const [facility, members] = await Promise.all([
    getFacilityById(program.facilityId),
    getMembers(),
  ]);

  return <ProgramRoster program={program} facility={facility} members={members} />;
}
