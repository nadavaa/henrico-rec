import { membershipTiers } from "@/data/seed";
import type { MembershipTier } from "@/data/types";

export async function getMembershipTiers(): Promise<MembershipTier[]> {
  return membershipTiers;
}

export async function getMembershipTierById(id: string): Promise<MembershipTier | null> {
  return membershipTiers.find((t) => t.id === id) ?? null;
}
