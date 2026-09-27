import { notFound } from "next/navigation";
import { getFacilityById, getProgramById } from "@/lib/data";
import { ClassBookingWizard } from "@/components/resident/class-booking-wizard";

export default async function BookProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getProgramById(id);
  if (!program) notFound();

  const facility = await getFacilityById(program.facilityId);

  return <ClassBookingWizard program={program} facility={facility} />;
}
