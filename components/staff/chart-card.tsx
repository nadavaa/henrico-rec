"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";

export function ChartCard({
  title,
  chart,
  tableHeaders,
  tableRows,
}: {
  title: string;
  chart: ReactNode;
  tableHeaders: string[];
  tableRows: (string | number)[][];
}) {
  const [showTable, setShowTable] = useState(false);
  const headingId = useId();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 id={headingId} className="font-semibold text-slate-900">
          {title}
        </h3>
        <button
          type="button"
          aria-pressed={showTable}
          onClick={() => setShowTable((s) => !s)}
          className="min-h-9 rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {showTable ? "View chart" : "View as table"}
        </button>
      </div>

      {showTable ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="border-b border-slate-200">
                {tableHeaders.map((h) => (
                  <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-medium text-slate-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap px-2 py-1.5 text-slate-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div aria-labelledby={headingId} role="img" className="mt-4 h-64">
          {chart}
        </div>
      )}
    </div>
  );
}
