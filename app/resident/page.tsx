import { getFacilities, getPrograms } from "@/lib/data";
import { ProgramBrowser } from "@/components/resident/program-browser";

export default async function ResidentHomePage() {
  const [programs, facilities] = await Promise.all([getPrograms(), getFacilities()]);

  return <ProgramBrowser programs={programs} facilities={facilities} />;
}
