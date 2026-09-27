"use client";

import { useState } from "react";

export function AskDataButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-9 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        Ask the data
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close panel"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="ask-data-heading"
            className="relative flex h-full w-full max-w-sm flex-col bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 id="ask-data-heading" className="text-lg font-semibold text-slate-900">
                AI reporting assistant
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-9 min-w-9 rounded-md text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <span aria-hidden="true">✕</span>
                <span className="sr-only">Close</span>
              </button>
            </div>
            <p className="mt-6 text-slate-600">AI reporting assistant (coming in next step)</p>
          </aside>
        </div>
      )}
    </>
  );
}
