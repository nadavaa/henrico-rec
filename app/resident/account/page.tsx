import { getFacilities, getMembershipTiers, getPrograms, getReservableSpaces } from "@/lib/data";
import { AccountView } from "@/components/resident/account-view";

export default async function AccountPage() {
  const [programs, facilities, tiers, spaces] = await Promise.all([
    getPrograms(),
    getFacilities(),
    getMembershipTiers(),
    getReservableSpaces(),
  ]);

  return <AccountView programs={programs} facilities={facilities} tiers={tiers} spaces={spaces} />;
}
