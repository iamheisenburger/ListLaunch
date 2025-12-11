"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function PlanPage() {
  const sites = useQuery(api.sites.list) ?? [];
  const site = sites[0];
  const plans = useQuery(
    api.plans.listBySite,
    site?._id ? { siteId: site._id } : "skip",
  );

  const generatePlan = useMutation(api.plans.generatePlan);
  const updateStatus = useMutation(api.plans.updateStatus);

  const handleGenerate = async () => {
    if (!site?._id) return;
    await generatePlan({ siteId: site._id, desiredCount: 100 });
  };

  const statuses = [
    "planned",
    "in_progress",
    "submitted",
    "live",
    "skipped",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Plan</h1>
          <p className="text-sm text-slate-300">
            Generate and manage the prioritized directory list.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!site?._id}
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          Generate plan
        </button>
      </div>

      {!site && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          Add a site first on the Site page.
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-6 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
          <span>Directory</span>
          <span>DR</span>
          <span>Traffic</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-white/5">
          {(plans ?? []).map((p) => (
            <div key={p._id} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
              <div className="truncate text-white">{p.directory?.name}</div>
              <div className="text-slate-200">{p.directory?.dr ?? "—"}</div>
              <div className="text-slate-200">
                {p.directory?.traffic
                  ? Math.round((p.directory.traffic as number) / 1000) + "k"
                  : "—"}
              </div>
              <div className="text-slate-200">{p.priority ?? "—"}</div>
              <div className="text-slate-200">{p.status ?? "planned"}</div>
              <div className="flex flex-wrap gap-1">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      updateStatus({ planId: p._id, status: s, notes: p.notes })
                    }
                    className={`rounded-full px-2 py-1 text-xs ${
                      p.status === s
                        ? "bg-emerald-500 text-white"
                        : "bg-white/10 text-slate-200 hover:bg-white/20"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <a
                  href={`/packs/${p._id}`}
                  className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200 hover:bg-white/20"
                >
                  Pack
                </a>
              </div>
            </div>
          ))}
          {!plans?.length && (
            <div className="px-4 py-6 text-sm text-slate-300">
              No plan yet. Generate one to get ~100 prioritized directories.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

