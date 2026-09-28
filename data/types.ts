// Shared domain types for the Henrico Rec demo.
// All monetary amounts are integer cents.

export type ProgramCategory =
  | "fitness"
  | "yoga"
  | "youth-sports"
  | "art"
  | "senior-wellness";

export interface Facility {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  description: string;
  amenities: string[];
}

export interface Program {
  id: string;
  facilityId: string;
  name: string;
  category: ProgramCategory;
  description: string;
  instructor: string;
  schedule: string; // e.g. "Tue & Thu, 6:00–7:00 PM"
  startDate: string; // ISO date
  endDate: string; // ISO date
  capacity: number;
  enrolled: number;
  priceCents: number;
  ageRange: string; // e.g. "Adults 18+", "Ages 6–12"
}

export interface MembershipTier {
  id: string;
  name: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
  description: string;
  benefits: string[];
}

export type MemberStatus = "active" | "inactive";

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  homeFacilityId: string;
  membershipTierId: string | null;
  joinDate: string; // ISO date
  status: MemberStatus;
}

export type SpaceType = "picnic-shelter" | "multipurpose-room" | "pavilion";

export interface ReservableSpace {
  id: string;
  facilityId: string;
  name: string;
  type: SpaceType;
  capacity: number;
  hourlyRateCents: number;
  amenities: string[];
  description: string;
}

export type TransactionType = "membership" | "enrollment";

export interface Transaction {
  id: string;
  type: TransactionType;
  memberId: string;
  date: string; // ISO date
  amountCents: number;
  // Present when type === "membership"
  membershipTierId?: string;
  // Present when type === "enrollment"
  programId?: string;
}
