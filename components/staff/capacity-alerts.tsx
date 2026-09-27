import type { CapacityAlert } from "@/lib/staff/types";

function AlertList({
  title,
  hint,
  alerts,
  tone,
}: {
  title: string;
  hint: string;
  alerts: CapacityAlert[];
  tone: "over" | "under";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500">{hint}</p>
      {alerts.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">None right now.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {alerts.map((a) => (
            <li
              key={a.programId}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-slate-900">{a.programName}</p>
                <p className="text-slate-500">
                  {a.park} · {a.schedule}
                </p>
              </div>
              <span
                className={
                  tone === "over"
                    ? "shrink-0 rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-800"
                    : "shrink-0 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800"
                }
              >
                {a.enrolled}/{a.capacity} ({Math.round(a.fillRatePct)}%)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CapacityAlertsPanel({
  overCapacity,
  underCapacity,
}: {
  overCapacity: CapacityAlert[];
  underCapacity: CapacityAlert[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <AlertList
        title="Near or at capacity"
        hint="90%+ full — consider adding a session"
        alerts={overCapacity}
        tone="over"
      />
      <AlertList
        title="Under-enrolled"
        hint="Under 30% full — consider promoting or consolidating"
        alerts={underCapacity}
        tone="under"
      />
    </div>
  );
}
