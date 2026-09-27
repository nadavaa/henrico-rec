import { getMembershipTiers } from "@/lib/data";
import { MembershipList } from "@/components/resident/membership-list";

export default async function MembershipsPage() {
  const tiers = await getMembershipTiers();
  return <MembershipList tiers={tiers} />;
}
