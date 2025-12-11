import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const now = () => Date.now();

export const list = query({
  handler: async (ctx) => {
    return ctx.db.query("sites").order("asc").collect();
  },
});

export const get = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, { siteId }) => ctx.db.get(siteId),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("sites")),
    domain: v.string(),
    name: v.optional(v.string()),
    mainGoal: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const domain = args.domain.trim().toLowerCase();
    if (args.id) {
      await ctx.db.patch(args.id, {
        domain,
        name: args.name,
        mainGoal: args.mainGoal,
        notes: args.notes,
        updatedAt: now(),
      });
      return args.id;
    }

    const existing = await ctx.db
      .query("sites")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .unique();
    if (existing?._id) {
      await ctx.db.patch(existing._id, {
        name: args.name ?? existing.name,
        mainGoal: args.mainGoal ?? existing.mainGoal,
        notes: args.notes ?? existing.notes,
        updatedAt: now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("sites", {
      domain,
      name: args.name,
      mainGoal: args.mainGoal,
      notes: args.notes,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});


