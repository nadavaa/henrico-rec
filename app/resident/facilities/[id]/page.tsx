import { notFound } from "next/navigation";
import { getFacilityById, getReservableSpaceById } from "@/lib/data";
import { FacilitySpaceDetail } from "@/components/resident/facility-space-detail";

export default async function ResidentFacilityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const space = await getReservableSpaceById(id);
  if (!space) notFound();

  const facility = await getFacilityById(space.facilityId);

  return <FacilitySpaceDetail space={space} facility={facility} />;
}
