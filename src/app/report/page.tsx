"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function ReportPage() {
  const sites = useQuery(api.sites.list) ?? [];
  const site = sites[0];
  const plans = useQuery(
    api.plans.listBySite,
    site?._id ? { siteId: site._id } : "skip",
  );

  const handleExport = () => {
    if (!plans?.length) return;
    const headers = [
      "Directory",
      "URL",
      "DR",
      "Traffic",
      "Priority",
      "Status",
      "Notes",
    ];
    const rows = plans.map((p) => [
      p.directory?.name ?? "",
      p.directory?.url ?? "",
      p.directory?.dr ?? "",
      p.directory?.traffic ?? "",
      p.priority ?? "",
      p.status ?? "",
      p.notes ?? "",
    ]);
    const csv =
      [headers, ...rows]
        .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "listlaunch-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Report</h1>
          <p className="text-sm text-slate-300">
            Export submission progress for usesubwise.app.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-6 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
          <span>Directory</span>
          <span>DR</span>
          <span>Traffic</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Notes</span>
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
              <div className="truncate text-slate-300">{p.notes ?? "—"}</div>
            </div>
          ))}
          {!plans?.length && (
            <div className="px-4 py-6 text-sm text-slate-300">
              No data yet. Generate a plan to see the report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

