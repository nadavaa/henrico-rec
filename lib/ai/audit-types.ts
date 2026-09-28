import type { ReportIntent } from "./types";
import type { StaffRole } from "@/lib/staff/roles";

export type ReviewerAction = "verified" | "flagged" | "none";

// "access" = a staff user opened the AI assistant; "question" = they asked it
// something. Both are logged so access to AI outputs is tracked per role.
export type AuditEventType = "access" | "question";

export interface AuditEntry {
  id: string;
  timestamp: string; // ISO
  eventType: AuditEventType;
  staffUser: string;
  role: StaffRole;
  question: string;
  intent: ReportIntent | null;
  provider: string;
  dataSources: string[];
  reviewerAction: ReviewerAction;
}
