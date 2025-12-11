"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type StatusFilter =
  | "all"
  | "planned"
  | "in_progress"
  | "submitted"
  | "live"
  | "skipped";

const statusLabels: StatusFilter[] = [
  "all",
  "planned",
  "in_progress",
  "submitted",
  "live",
  "skipped",
];

export default function PlanPage() {
  const sites = useQuery(api.sites.list) ?? [];
  const site = sites[0];
  const plans = useQuery(
    api.plans.listBySite,
    site?._id ? { siteId: site._id } : "skip",
  );

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [openPlanId, setOpenPlanId] = useState<Id<"directory_plans"> | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);
  const [packLoading, setPackLoading] = useState(false);

  const generatePlan = useMutation(api.plans.generatePlan);
  const updateStatus = useMutation(api.plans.updateStatus);
  const updateNotes = useMutation(api.plans.updateNotes);
  const generatePack = useAction(api.submissions.generatePack);

  const openPack = useQuery(
    api.submissions.getByPlan,
    openPlanId ? { planId: openPlanId } : "skip",
  );

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  const handleGenerate = async () => {
    if (!site?._id) return;
    await generatePlan({ siteId: site._id, desiredCount: 100 });
    showToast("Plan generated (up to 100 directories).");
  };

  const handleStatus = async (
    planId: Id<"directory_plans">,
    status: string,
    notes?: string,
  ) => {
    await updateStatus({ planId, status, notes });
    showToast(`Status set to ${status}`);
  };

  const handleNotes = async (
    planId: Id<"directory_plans">,
    notes?: string,
  ) => {
    await updateNotes({ planId, notes });
    showToast("Notes saved");
  };

  const handleGeneratePack = async (planId: Id<"directory_plans">) => {
    try {
      setPackLoading(true);
      await generatePack({ planId });
      showToast("Pack ready");
    } finally {
      setPackLoading(false);
    }
  };

  const copyText = async (text?: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    showToast("Copied");
  };

  const computed = useMemo(() => {
    const data = plans ?? [];
    const counts: Record<string, number> = {
      planned: 0,
      in_progress: 0,
      submitted: 0,
      live: 0,
      skipped: 0,
    };
    data.forEach((p) => {
      const s = (p.status as string) ?? "planned";
      counts[s] = (counts[s] ?? 0) + 1;
    });
    const total = data.length || 1;
    const done = counts.live + counts.submitted + counts.skipped;
    const progress = Math.round((done / total) * 100);
    return { counts, total: data.length, done, progress };
  }, [plans]);

  const filteredPlans = useMemo(() => {
    if (!plans) return [];
    if (filter === "all") return plans;
    return plans.filter((p) => (p.status ?? "planned") === filter);
  }, [plans, filter]);

  useEffect(() => {
    if (plans && !openPlanId && plans.length > 0) {
      setOpenPlanId(plans[0]._id as Id<"directory_plans">);
    }
  }, [plans, openPlanId]);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-20 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Plan</h1>
          <p className="text-sm text-slate-300">
            Prioritize directories, see progress, and open packs inline.
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

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Progress
            </div>
            <div className="text-lg font-semibold text-white">
              {computed.done} / {computed.total || 0} done
            </div>
            <div className="mt-1 h-2 w-48 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${computed.progress}%` }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            {statusLabels.slice(1).map((s) => (
              <span
                key={s}
                className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200"
              >
                {s}: {computed.counts[s] ?? 0}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusLabels.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === s
                ? "bg-emerald-500 text-white"
                : "bg-white/10 text-slate-200 hover:bg-white/20"
            }`}
          >
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-7 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
          <span>Directory</span>
          <span>DR</span>
          <span>Traffic</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Notes</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-white/5">
          {(filteredPlans ?? []).map((p) => (
            <div key={p._id} className="bg-transparent">
              <div className="grid grid-cols-7 items-center px-4 py-3 text-sm">
                <div className="truncate text-white">{p.directory?.name}</div>
                <div className="text-slate-200">{p.directory?.dr ?? "—"}</div>
                <div className="text-slate-200">
                  {p.directory?.traffic
                    ? Math.round((p.directory.traffic as number) / 1000) + "k"
                    : "—"}
                </div>
                <div className="text-slate-200">{p.priority ?? "—"}</div>
                <div className="text-slate-200">{p.status ?? "planned"}</div>
                <div>
                  <input
                    defaultValue={p.notes ?? ""}
                    onBlur={(e) =>
                      handleNotes(p._id as Id<"directory_plans">, e.target.value)
                    }
                    placeholder="Notes"
                    className="w-full rounded-lg bg-white/10 px-2 py-1 text-xs text-white placeholder:text-slate-400 outline-none ring-0"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {statusLabels
                    .filter((s) => s !== "all")
                    .map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          handleStatus(p._id as Id<"directory_plans">, s, p.notes)
                        }
                        className={`rounded-full px-2 py-1 text-xs ${
                          (p.status ?? "planned") === s
                            ? "bg-emerald-500 text-white"
                            : "bg-white/10 text-slate-200 hover:bg-white/20"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  <button
                    onClick={() =>
                      setOpenPlanId(
                        p._id === openPlanId ? null : (p._id as Id<"directory_plans">),
                      )
                    }
                    className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200 hover:bg-white/20"
                  >
                    {p._id === openPlanId ? "Hide pack" : "Pack"}
                  </button>
                </div>
              </div>

              {openPlanId === p._id && (
                <div className="grid grid-cols-1 gap-3 bg-white/5 px-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wide text-slate-300">
                      Submission pack
                    </div>
                    <button
                      onClick={() => handleGeneratePack(p._id as Id<"directory_plans">)}
                      className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600"
                      disabled={packLoading}
                    >
                      {openPack ? "Regenerate" : "Generate pack"}
                    </button>
                  </div>

                  {openPack ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        { label: "Title", value: openPack.title },
                        { label: "Alt titles", value: (openPack.altTitles ?? []).join("\n") },
                        { label: "Tagline", value: openPack.tagline },
                        {
                          label: "Alt taglines",
                          value: (openPack.altTaglines ?? []).join("\n"),
                        },
                        { label: "Short blurb", value: openPack.shortBlurb },
                        { label: "Short description", value: openPack.shortDescription },
                        { label: "Long description", value: openPack.longDescription },
                        {
                          label: "Categories",
                          value: (openPack.categories ?? []).join(", "),
                        },
                        { label: "Tags", value: (openPack.tags ?? []).join(", ") },
                        { label: "UTM URL", value: openPack.utmUrl },
                        { label: "CTA", value: openPack.cta },
                      ].map((f) => (
                        <div
                          key={f.label}
                          className="rounded-lg border border-white/10 bg-white/5 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                              {f.label}
                            </div>
                            <button
                              onClick={() => copyText(f.value)}
                              className="text-[11px] text-emerald-300 hover:text-emerald-200"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="whitespace-pre-line text-sm text-white">
                            {f.value || "—"}
                          </div>
                        </div>
                      ))}

                      {openPack.extraFields && (
                        <div className="rounded-lg border border-white/10 bg-white/5 p-3 md:col-span-2">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                              Extra fields
                            </div>
                            <button
                              onClick={() =>
                                copyText(
                                  Object.entries(openPack.extraFields ?? {})
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join("\n"),
                                )
                              }
                              className="text-[11px] text-emerald-300 hover:text-emerald-200"
                            >
                              Copy all
                            </button>
                          </div>
                          <div className="space-y-1 text-sm text-white">
                            {Object.entries(openPack.extraFields).map(([k, v]) => (
                              <div key={k}>
                                <span className="font-semibold">{k}: </span>
                                <span>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-3 text-sm text-slate-300">
                      No pack yet. Generate to get directory-tailored copy.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {!filteredPlans.length && (
            <div className="px-4 py-6 text-sm text-slate-300">
              No plan yet. Generate one to get ~100 prioritized directories.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

