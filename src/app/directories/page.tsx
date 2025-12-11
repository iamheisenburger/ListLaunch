"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function DirectoriesPage() {
  const directories = useQuery(api.directories.list, {}) ?? [];
  const seed = useMutation(api.directories.seedDefault);

  const handleSeed = async () => {
    await seed({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Directories</h1>
          <p className="text-sm text-slate-300">
            Starter SaaS/AI directories used to build your plan.
          </p>
        </div>
        <button
          onClick={handleSeed}
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
        >
          Seed defaults
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {directories.map((d) => (
          <div
            key={d._id}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span className="font-semibold text-white">{d.name}</span>
              {d.isPremium && (
                <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs text-amber-200">
                  Premium
                </span>
              )}
            </div>
            <div className="text-sm text-emerald-200">{d.url}</div>
            <div className="mt-2 flex gap-4 text-xs text-slate-300">
              <span>DR {d.dr ?? "—"}</span>
              <span>Traffic {d.traffic ? Math.round(d.traffic / 1000) + "k" : "—"}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
              {(d.niches ?? []).map((n) => (
                <span
                  key={n}
                  className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-200"
                >
                  {n}
                </span>
              ))}
            </div>
            {d.notes && <div className="mt-2 text-xs text-slate-400">{d.notes}</div>}
          </div>
        ))}
        {!directories.length && (
          <div className="text-sm text-slate-300">
            No directories yet. Click “Seed defaults” to load the starter set.
          </div>
        )}
      </div>
    </div>
  );
}

