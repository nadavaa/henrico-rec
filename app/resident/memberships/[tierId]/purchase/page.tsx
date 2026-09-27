import { notFound } from "next/navigation";
import { getMembershipTierById } from "@/lib/data";
import { MembershipPurchaseWizard } from "@/components/resident/membership-purchase-wizard";

export default async function PurchaseMembershipPage({
  params,
}: {
  params: Promise<{ tierId: string }>;
}) {
  const { tierId } = await params;
  const tier = await getMembershipTierById(tierId);
  if (!tier) notFound();

  return <MembershipPurchaseWizard tier={tier} />;
}
