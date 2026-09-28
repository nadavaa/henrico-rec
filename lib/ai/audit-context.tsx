"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReportIntent } from "./types";
import { useStaffRole } from "@/lib/staff/role-context";
import type { AuditEntry, ReviewerAction } from "./audit-types";

interface AiAuditValue {
  entries: AuditEntry[];
  logQuestion: (input: {
    question: string;
    intent: ReportIntent | null;
    provider: string;
    dataSources: string[];
  }) => string;
  logAccess: () => void;
  setReviewerAction: (id: string, action: ReviewerAction) => void;
}

const AiAuditContext = createContext<AiAuditValue | null>(null);

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AiAuditProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const { role, staffUser } = useStaffRole();

  const value = useMemo<AiAuditValue>(
    () => ({
      entries,
      logQuestion: (input) => {
        const id = createId();
        const entry: AuditEntry = {
          id,
          timestamp: new Date().toISOString(),
          eventType: "question",
          staffUser,
          role,
          question: input.question,
          intent: input.intent,
          provider: input.provider,
          dataSources: input.dataSources,
          reviewerAction: "none",
        };
        setEntries((prev) => [entry, ...prev]);
        return id;
      },
      logAccess: () => {
        const entry: AuditEntry = {
          id: createId(),
          timestamp: new Date().toISOString(),
          eventType: "access",
          staffUser,
          role,
          question: "Opened the AI reporting assistant",
          intent: null,
          provider: "—",
          dataSources: [],
          reviewerAction: "none",
        };
        setEntries((prev) => [entry, ...prev]);
      },
      setReviewerAction: (id, action) => {
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, reviewerAction: action } : e)));
      },
    }),
    [entries, role, staffUser],
  );

  return <AiAuditContext.Provider value={value}>{children}</AiAuditContext.Provider>;
}

export function useAiAudit(): AiAuditValue {
  const ctx = useContext(AiAuditContext);
  if (!ctx) throw new Error("useAiAudit must be used within AiAuditProvider");
  return ctx;
}
