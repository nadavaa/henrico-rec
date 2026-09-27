import { members } from "@/data/seed";
import type { Member } from "@/data/types";

export async function getMembers(): Promise<Member[]> {
  return members;
}

export async function getMemberById(id: string): Promise<Member | null> {
  return members.find((m) => m.id === id) ?? null;
}
