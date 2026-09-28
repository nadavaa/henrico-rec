export type AudienceType = "class_roster" | "facility_waitlist" | "all_active_members";

export interface OutboxEntry {
  id: string;
  timestamp: string; // ISO
  audience: string; // human-readable label, e.g. "Class roster: Total Body Strength"
  recipientCount: number;
  subject: string;
  automatic: boolean;
}
