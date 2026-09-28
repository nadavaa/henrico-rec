export type DateRangeDays = 30 | 90 | 365;

export interface StaffFilters {
  facilityId: string | "all";
  rangeDays: DateRangeDays;
}

export interface Kpis {
  totalRevenueCents: number;
  activeMemberships: number;
  classEnrollments: number;
  avgFillRatePct: number;
  waitlistedResidents: number;
}

export interface MonthlyRevenuePoint {
  month: string;
  membershipCents: number;
  programCents: number;
}

export interface CategoryFillPoint {
  category: string;
  fillRatePct: number;
}

export interface ParkEnrollmentPoint {
  park: string;
  enrollments: number;
}

export interface CapacityAlert {
  programId: string;
  programName: string;
  park: string;
  schedule: string;
  fillRatePct: number;
  enrolled: number;
  capacity: number;
}

export interface TransactionRow {
  id: string;
  date: string;
  type: "membership" | "enrollment" | "facility_reservation";
  memberName: string;
  itemLabel: string;
  amountCents: number;
  paymentMethod: string;
  status: "Completed";
  // Undefined for session membership purchases (the demo resident has no
  // single home facility in this model).
  facilityId?: string;
  // Only present on enrollment rows.
  programId?: string;
}
