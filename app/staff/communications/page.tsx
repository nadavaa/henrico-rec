import { getFacilities, getMembers, getPrograms } from "@/lib/data";
import { CommunicationsCompose } from "@/components/staff/communications-compose";

export default async function StaffCommunicationsPage() {
  const [programs, facilities, members] = await Promise.all([
    getPrograms(),
    getFacilities(),
    getMembers(),
  ]);

  return <CommunicationsCompose programs={programs} facilities={facilities} members={members} />;
}
