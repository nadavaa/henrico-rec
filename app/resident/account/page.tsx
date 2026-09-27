import { getFacilities, getMembershipTiers, getPrograms } from "@/lib/data";
import { AccountView } from "@/components/resident/account-view";

export default async function AccountPage() {
  const [programs, facilities, tiers] = await Promise.all([
    getPrograms(),
    getFacilities(),
    getMembershipTiers(),
  ]);

  return <AccountView programs={programs} facilities={facilities} tiers={tiers} />;
}
