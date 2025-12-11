"use client";

import { useAction, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";

export default function PackPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params?.planId as string | undefined;

  const pack = useQuery(
    api.submissions.getByPlan,
    planId ? { planId } : "skip",
  );

  const planDetails = useQuery(
    api.submissions.planDetails,
    planId ? { planId } : "skip",
  );

  const generatePack = useAction(api.submissions.generatePack);

  const handleGenerate = async () => {
    if (!planId) return;
    await generatePack({ planId });
  };

  if (!planId) {
    return (
      <div className="text-sm text-slate-300">
        No plan id provided. Return to{" "}
        <button className="underline" onClick={() => router.push("/plan")}>
          plan
        </button>
        .
      </div>
    );
  }

  const fields = [
    { label: "Title", value: pack?.title },
    { label: "Tagline", value: pack?.tagline },
    { label: "Short description", value: pack?.shortDescription },
    { label: "Long description", value: pack?.longDescription },
    { label: "Categories", value: (pack?.categories ?? []).join(", ") },
    { label: "Tags", value: (pack?.tags ?? []).join(", ") },
    { label: "UTM URL", value: pack?.utmUrl },
    { label: "CTA", value: pack?.cta },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Submission pack</h1>
          <p className="text-sm text-slate-300">
            Copy/paste the generated fields into the directory form.
          </p>
          {planDetails?.directory && (
            <div className="text-xs text-slate-400">
              {planDetails.directory.name} — {planDetails.directory.url}
            </div>
          )}
        </div>
        <button
          onClick={handleGenerate}
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
        >
          {pack ? "Regenerate" : "Generate pack"}
        </button>
      </div>

      {pack ? (
        <div className="space-y-3">
          {fields.map((f) => (
            <div
              key={f.label}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                {f.label}
              </div>
              <div className="whitespace-pre-line text-sm text-white">
                {f.value || "—"}
              </div>
            </div>
          ))}
          {pack.extraFields && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Extra fields
              </div>
              <div className="space-y-2 text-sm text-white">
                {Object.entries(pack.extraFields).map(([k, v]) => (
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
        <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-slate-300">
          No pack yet. Generate one to get tailored copy for this directory.
        </div>
      )}
    </div>
  );
}

