import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

const now = () => Date.now();

type Directory = {
  _id: Id<"directories">;
  name: string;
  url: string;
  dr?: number;
  traffic?: number;
  niches?: string[];
  isPremium?: boolean;
  notes?: string;
};

type Site = {
  _id: Id<"sites">;
  domain: string;
  mainGoal?: string;
};

const scoreDirectory = (dir: Directory, goal: string | undefined) => {
  const dr = dir.dr ?? 0;
  const traffic = dir.traffic ?? 0;
  if (goal === "awareness") {
    return traffic * 1.0 + dr * 1000;
  }
  return dr * 10000 + traffic * 0.5;
};

export const listBySite = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, { siteId }) => {
    const plans = await ctx.db
      .query("directory_plans")
      .withIndex("by_site", (q) => q.eq("siteId", siteId))
      .order("asc")
      .collect();

    const directoryIds = Array.from(new Set(plans.map((p) => p.directoryId)));
    const directoryMap = new Map<Id<"directories">, Directory>();
    for (const id of directoryIds) {
      const dir = await ctx.db.get(id);
      if (dir) directoryMap.set(id, dir as Directory);
    }

    return plans.map((p) => ({
      ...p,
      directory: directoryMap.get(p.directoryId),
    }));
  },
});

export const updateStatus = mutation({
  args: {
    planId: v.id("directory_plans"),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { planId, status, notes }) => {
    const patch: Record<string, unknown> = {
      status,
      notes,
      statusUpdatedAt: now(),
      updatedAt: now(),
    };
    if (status === "submitted") {
      patch.submittedAt = now();
    }
    if (status === "live") {
      patch.liveAt = now();
    }
    await ctx.db.patch(planId, patch);
  },
});

export const updateNotes = mutation({
  args: {
    planId: v.id("directory_plans"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { planId, notes }) => {
    await ctx.db.patch(planId, {
      notes,
      updatedAt: now(),
    });
  },
});

export const generatePlan = mutation({
  args: {
    siteId: v.id("sites"),
    desiredCount: v.optional(v.number()),
  },
  handler: async (ctx, { siteId, desiredCount }) => {
    const site = (await ctx.db.get(siteId)) as Site | null;
    if (!site) throw new Error("Site not found");

    const directories = (await ctx.db.query("directories").collect()) as Directory[];
    if (!directories.length) {
      throw new Error("No directories seeded yet. Run seedDefault first.");
    }

    const sorted = directories
      .map((d) => ({ ...d, score: scoreDirectory(d, site.mainGoal) }))
      .sort((a, b) => b.score - a.score);

    const limit = desiredCount ?? 100;
    const selection = sorted.slice(0, limit);

    let created = 0;
    for (let i = 0; i < selection.length; i++) {
      const dir = selection[i];
      const existing = await ctx.db
        .query("directory_plans")
        .withIndex("by_site", (q) => q.eq("siteId", siteId))
        .filter((q) => q.eq(q.field("directoryId"), dir._id))
        .unique();
      if (existing?._id) continue;

      const priority = Math.min(5, Math.floor(i / 20) + 1);
      await ctx.db.insert("directory_plans", {
        siteId,
        directoryId: dir._id,
        priority,
        goal: site.mainGoal ?? "DR",
        status: "planned",
        createdAt: now(),
        updatedAt: now(),
      });
      created += 1;
    }

    return { created };
  },
});

