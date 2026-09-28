import { getFacilities, getReservableSpaces } from "@/lib/data";
import { FacilitiesBrowser } from "@/components/resident/facilities-browser";

export default async function ResidentFacilitiesPage() {
  const [spaces, facilities] = await Promise.all([getReservableSpaces(), getFacilities()]);
  return <FacilitiesBrowser spaces={spaces} facilities={facilities} />;
}
