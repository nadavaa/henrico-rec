"use client";

import { useEffect, useId, useState } from "react";
import type { Facility, Member, Program } from "@/data/types";
import { useResidentSession } from "@/lib/resident/session-context";
import { useOutbox } from "@/lib/communications/outbox-context";
import {
  getActiveMembersCount,
  getClassRosterCount,
  getFacilityWaitlistCount,
} from "@/lib/communications/audience";
import type { AudienceType } from "@/lib/communications/types";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CommunicationsCompose({
  programs,
  facilities,
  members,
}: {
  programs: Program[];
  facilities: Facility[];
  members: Member[];
}) {
  const { bookings } = useResidentSession();
  const { entries, addEntry } = useOutbox();

  const [audienceType, setAudienceType] = useState<AudienceType>("class_roster");
  const [programId, setProgramId] = useState(programs[0]?.id ?? "");
  const [facilityId, setFacilityId] = useState(facilities[0]?.id ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastId = useId();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function recipientCountAndLabel(): { count: number; label: string } {
    if (audienceType === "class_roster") {
      const program = programs.find((p) => p.id === programId);
      return {
        count: program ? getClassRosterCount(program, bookings) : 0,
        label: `Class roster: ${program?.name ?? "—"}`,
      };
    }
    if (audienceType === "facility_waitlist") {
      const facility = facilities.find((f) => f.id === facilityId);
      return {
        count: facility ? getFacilityWaitlistCount(facility.id, programs, bookings) : 0,
        label: `Facility waitlist: ${facility?.name ?? "—"}`,
      };
    }
    return { count: getActiveMembersCount(members), label: "All active members" };
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const { count, label } = recipientCountAndLabel();
    addEntry({ audience: label, recipientCount: count, subject, automatic: false });
    setToast(`Message sent to ${count} recipient${count === 1 ? "" : "s"}.`);
    setSubject("");
    setBody("");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Communications</h1>
      <p className="mt-1 text-slate-600">
        Compose a message to residents. This is a demo — nothing is actually sent.
      </p>

      <form onSubmit={handleSend} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Audience</legend>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="audience"
                checked={audienceType === "class_roster"}
                onChange={() => setAudienceType("class_roster")}
                className="h-4 w-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              />
              A specific class&apos;s roster
            </label>
            {audienceType === "class_roster" && (
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                aria-label="Choose class"
                className="ml-6 block max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="audience"
                checked={audienceType === "facility_waitlist"}
                onChange={() => setAudienceType("facility_waitlist")}
                className="h-4 w-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              />
              A specific facility&apos;s waitlist
            </label>
            {audienceType === "facility_waitlist" && (
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                aria-label="Choose facility"
                className="ml-6 block max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="audience"
                checked={audienceType === "all_active_members"}
                onChange={() => setAudienceType("all_active_members")}
                className="h-4 w-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              />
              All active members
            </label>
          </div>
        </fieldset>

        <div>
          <label htmlFor="comms-subject" className="block text-sm font-medium text-slate-700">
            Subject
          </label>
          <input
            id="comms-subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          />
        </div>

        <div>
          <label htmlFor="comms-body" className="block text-sm font-medium text-slate-700">
            Message
          </label>
          <textarea
            id="comms-body"
            required
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          />
        </div>

        <button
          type="submit"
          className="min-h-11 rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
        >
          Send
        </button>

        <p id={toastId} aria-live="polite" className="text-sm font-medium text-emerald-700">
          {toast}
        </p>
      </form>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Outbox</h2>
      {entries.length === 0 ? (
        <p className="mt-2 rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
          No messages sent yet this session.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Timestamp</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Audience</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Recipients</th>
                <th scope="col" className="px-3 py-2 font-medium text-slate-600">Subject</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                    {formatTimestamp(entry.timestamp)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">{entry.audience}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">{entry.recipientCount}</td>
                  <td className="px-3 py-2 text-slate-700">{entry.subject}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
