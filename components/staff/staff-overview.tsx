"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Facility, Member, MembershipTier, Program, ReservableSpace, Transaction } from "@/data/types";
import { useResidentSession } from "@/lib/resident/session-context";
import { useFacilityReservations } from "@/lib/facilities/reservation-context";
import { formatCents } from "@/lib/format";
import type { StaffFilters } from "@/lib/staff/types";
import {
  buildFacilityReservationRows,
  buildTransactionRows,
  computeCapacityAlerts,
  computeEnrollmentsByPark,
  computeFillRateByCategory,
  computeKpis,
  computeRevenueByMonth,
} from "@/lib/staff/metrics";
import { KpiCard } from "./kpi-card";
import { ChartCard } from "./chart-card";
import { FiltersBar } from "./filters-bar";
import { CapacityAlertsPanel } from "./capacity-alerts";

export function StaffOverview({
  programs,
  facilities,
  members,
  tiers,
  transactions,
  spaces,
}: {
  programs: Program[];
  facilities: Facility[];
  members: Member[];
  tiers: MembershipTier[];
  transactions: Transaction[];
  spaces: ReservableSpace[];
}) {
  const { bookings, membership } = useResidentSession();
  const { reservations } = useFacilityReservations();
  const [filters, setFilters] = useState<StaffFilters>({ facilityId: "all", rangeDays: 30 });
  const today = useMemo(() => new Date(), []);

  const transactionRows = useMemo(
    () => [
      ...buildTransactionRows(transactions, members, programs, tiers, bookings, membership),
      ...buildFacilityReservationRows(reservations, spaces),
    ],
    [transactions, members, programs, tiers, bookings, membership, reservations, spaces],
  );

  const kpis = useMemo(
    () => computeKpis(programs, members, transactionRows, bookings, membership, filters, today),
    [programs, members, transactionRows, bookings, membership, filters, today],
  );

  const revenueByMonth = useMemo(
    () => computeRevenueByMonth(transactionRows, filters, today),
    [transactionRows, filters, today],
  );
  const enrollmentsByPark = useMemo(
    () => computeEnrollmentsByPark(programs, facilities, bookings, filters),
    [programs, facilities, bookings, filters],
  );
  const fillRateByCategory = useMemo(
    () => computeFillRateByCategory(programs, bookings, filters),
    [programs, bookings, filters],
  );
  const { overCapacity, underCapacity } = useMemo(
    () => computeCapacityAlerts(programs, facilities, bookings, filters),
    [programs, facilities, bookings, filters],
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Overview</h1>
      <p className="mt-1 text-slate-600">Recreation and parks performance at a glance.</p>

      <div className="mt-6">
        <FiltersBar facilities={facilities} filters={filters} onChange={setFilters} />
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Total revenue" value={formatCents(kpis.totalRevenueCents)} />
        <KpiCard label="Active memberships" value={String(kpis.activeMemberships)} />
        <KpiCard label="Class enrollments" value={String(kpis.classEnrollments)} />
        <KpiCard label="Avg. fill rate" value={`${Math.round(kpis.avgFillRatePct)}%`} />
        <KpiCard label="Waitlisted residents" value={String(kpis.waitlistedResidents)} />
      </dl>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="xl:col-span-2">
          <ChartCard
            title="Revenue by month"
            tableHeaders={["Month", "Memberships", "Programs"]}
            tableRows={revenueByMonth.map((p) => [
              p.month,
              formatCents(p.membershipCents),
              formatCents(p.programCents),
            ])}
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v / 100}`} />
                  <Tooltip formatter={(v) => formatCents(Number(v))} />
                  <Legend />
                  <Line type="monotone" dataKey="membershipCents" name="Memberships" stroke="#1d4ed8" strokeWidth={2} />
                  <Line type="monotone" dataKey="programCents" name="Programs" stroke="#059669" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            }
          />
        </div>

        <ChartCard
          title="Enrollments by park"
          tableHeaders={["Park", "Enrollments"]}
          tableRows={enrollmentsByPark.map((p) => [p.park, p.enrollments])}
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentsByPark}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="park" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          }
        />

        <ChartCard
          title="Fill rate by category"
          tableHeaders={["Category", "Fill rate"]}
          tableRows={fillRateByCategory.map((p) => [p.category, `${Math.round(p.fillRatePct)}%`])}
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fillRateByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis stroke="#64748b" fontSize={12} unit="%" />
                <Tooltip formatter={(v) => `${Math.round(Number(v))}%`} />
                <Bar dataKey="fillRatePct" name="Fill rate" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          }
        />
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Capacity alerts</h2>
        <div className="mt-3">
          <CapacityAlertsPanel overCapacity={overCapacity} underCapacity={underCapacity} />
        </div>
      </div>
    </div>
  );
}
