import { reservableSpaces } from "@/data/seed";
import type { ReservableSpace } from "@/data/types";

export async function getReservableSpaces(): Promise<ReservableSpace[]> {
  return reservableSpaces;
}

export async function getReservableSpaceById(id: string): Promise<ReservableSpace | null> {
  return reservableSpaces.find((s) => s.id === id) ?? null;
}
