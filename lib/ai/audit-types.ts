import type { ReportIntent } from "./types";

export type ReviewerAction = "verified" | "flagged" | "none";

export interface AuditEntry {
  id: string;
  timestamp: string; // ISO
  staffUser: string;
  question: string;
  intent: ReportIntent | null;
  provider: string;
  dataSources: string[];
  reviewerAction: ReviewerAction;
}

export const DEMO_STAFF_USER = "Demo Staff";
