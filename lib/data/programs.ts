import { programs } from "@/data/seed";
import type { Program } from "@/data/types";

export async function getPrograms(): Promise<Program[]> {
  return programs;
}

export async function getProgramById(id: string): Promise<Program | null> {
  return programs.find((p) => p.id === id) ?? null;
}

export async function getProgramsByFacility(facilityId: string): Promise<Program[]> {
  return programs.filter((p) => p.facilityId === facilityId);
}
