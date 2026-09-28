"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { OutboxEntry } from "./types";

interface OutboxValue {
  entries: OutboxEntry[];
  addEntry: (input: Omit<OutboxEntry, "id" | "timestamp">) => string;
}

const OutboxContext = createContext<OutboxValue | null>(null);

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function OutboxProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<OutboxEntry[]>([]);

  const value = useMemo<OutboxValue>(
    () => ({
      entries,
      addEntry: (input) => {
        const id = createId();
        setEntries((prev) => [{ id, timestamp: new Date().toISOString(), ...input }, ...prev]);
        return id;
      },
    }),
    [entries],
  );

  return <OutboxContext.Provider value={value}>{children}</OutboxContext.Provider>;
}

export function useOutbox(): OutboxValue {
  const ctx = useContext(OutboxContext);
  if (!ctx) throw new Error("useOutbox must be used within OutboxProvider");
  return ctx;
}
