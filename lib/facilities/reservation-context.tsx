"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReservationRequest, ReservationStatus } from "./types";

interface FacilityReservationValue {
  reservations: ReservationRequest[];
  createReservation: (input: {
    spaceId: string;
    requesterName: string;
    dates: string[];
    timeBlockId: string;
    recurring: boolean;
    amountCents: number;
    paymentId: string;
  }) => string;
  approveReservation: (id: string) => void;
  denyReservation: (id: string) => void;
}

const FacilityReservationContext = createContext<FacilityReservationValue | null>(null);

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function FacilityReservationProvider({ children }: { children: React.ReactNode }) {
  const [reservations, setReservations] = useState<ReservationRequest[]>([]);

  const value = useMemo<FacilityReservationValue>(
    () => ({
      reservations,
      createReservation: (input) => {
        const id = createId();
        const request: ReservationRequest = {
          id,
          status: "pending" as ReservationStatus,
          createdAt: new Date().toISOString(),
          ...input,
        };
        setReservations((prev) => [request, ...prev]);
        return id;
      },
      approveReservation: (id) => {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
      },
      denyReservation: (id) => {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: "denied" } : r)));
      },
    }),
    [reservations],
  );

  return (
    <FacilityReservationContext.Provider value={value}>{children}</FacilityReservationContext.Provider>
  );
}

export function useFacilityReservations(): FacilityReservationValue {
  const ctx = useContext(FacilityReservationContext);
  if (!ctx) throw new Error("useFacilityReservations must be used within FacilityReservationProvider");
  return ctx;
}
