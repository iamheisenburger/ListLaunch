export default function Home() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-semibold text-white">ListLaunch</h1>
        <p className="mt-2 text-slate-300">
          Plan and track directory submissions for usesubwise.app. Generate a
          prioritized list, create submission packs, and export progress.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/site"
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
          >
            Configure site
          </a>
          <a
            href="/directories"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-white/40"
          >
            View directories
          </a>
          <a
            href="/plan"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-white/40"
          >
            Generate plan
          </a>
          <a
            href="/report"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-white/40"
          >
            Export report
          </a>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "1) Seed directories", desc: "Load the starter SaaS/AI list." },
          { title: "2) Generate plan", desc: "Pick ~100 best fits by DR/traffic." },
          { title: "3) Submission packs", desc: "Copy/paste titles, descriptions, UTM links." },
          { title: "4) Track status", desc: "Mark planned → submitted → live." },
          { title: "5) Export report", desc: "Download CSV for delivered listings." },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="text-sm font-semibold text-white">{card.title}</div>
            <div className="text-sm text-slate-300">{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
