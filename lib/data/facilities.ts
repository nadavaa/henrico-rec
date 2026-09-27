import { facilities } from "@/data/seed";
import type { Facility } from "@/data/types";

// Data access layer: reads from the static seed today. A real deployment
// would swap this file's contents for database queries without changing
// callers, since everything here is async-shaped.

export async function getFacilities(): Promise<Facility[]> {
  return facilities;
}

export async function getFacilityById(id: string): Promise<Facility | null> {
  return facilities.find((f) => f.id === id) ?? null;
}
