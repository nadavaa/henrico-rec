import { notFound } from "next/navigation";
import { getFacilityById, getProgramById } from "@/lib/data";
import { ProgramDetail } from "@/components/resident/program-detail";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getProgramById(id);
  if (!program) notFound();

  const facility = await getFacilityById(program.facilityId);

  return <ProgramDetail program={program} facility={facility} />;
}
