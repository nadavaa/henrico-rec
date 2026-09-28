import { getFacilities, getReservableSpaces } from "@/lib/data";
import { FacilitiesRequestsTable } from "@/components/staff/facilities-requests-table";

export default async function StaffFacilitiesPage() {
  const [spaces, facilities] = await Promise.all([getReservableSpaces(), getFacilities()]);
  return <FacilitiesRequestsTable spaces={spaces} facilities={facilities} />;
}
