"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export default function SitePage() {
  const sites = useQuery(api.sites.list) ?? [];
  const primary = sites[0];
  const [domain, setDomain] = useState(primary?.domain ?? "");
  const [name, setName] = useState(primary?.name ?? "");
  const [mainGoal, setMainGoal] = useState(primary?.mainGoal ?? "DR");
  const [notes, setNotes] = useState(primary?.notes ?? "");

  const upsert = useMutation(api.sites.upsert);

  const handleSave = async () => {
    await upsert({
      id: primary?._id,
      domain: domain || "",
      name,
      mainGoal,
      notes,
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-white">Site settings</h1>
        <p className="text-sm text-slate-300">
          Set the primary site we will plan submissions for.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-200">
            <span>Domain</span>
            <input
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              placeholder="usesubwise.app"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            <span>Name</span>
            <input
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              placeholder="Subwise"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            <span>Main goal</span>
            <select
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
            >
              <option value="DR">Domain Rating</option>
              <option value="awareness">Awareness / traffic</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            <span>Notes</span>
            <textarea
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              rows={3}
              placeholder="Product positioning, keywords, tone"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSave}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
          >
            Save site
          </button>
          {primary && (
            <span className="text-sm text-slate-400">
              Current: {primary.domain}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


