import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const now = () => Date.now();

const starterDirectories = [
  {
    name: "Capterra",
    url: "https://www.capterra.com/",
    dr: 93,
    traffic: 4200000,
    niches: ["Technology & Software", "Business & B2B"],
    isPremium: true,
    notes: "High authority software directory",
  },
  {
    name: "Product Hunt",
    url: "https://www.producthunt.com/",
    dr: 90,
    traffic: 32100000,
    niches: ["Technology & Software", "AI Assistants"],
  },
  {
    name: "Futurepedia",
    url: "https://www.futurepedia.io/",
    dr: 78,
    traffic: 890000,
    niches: ["AI Assistants & Virtual Agents"],
  },
  {
    name: "SaaSworthy",
    url: "https://www.saasworthy.com/",
    dr: 72,
    traffic: 256000,
    niches: ["Technology & Software"],
  },
  {
    name: "GetApp",
    url: "https://www.getapp.com/",
    dr: 88,
    traffic: 3100000,
    niches: ["Technology & Software"],
    isPremium: true,
  },
  {
    name: "Software Advice",
    url: "https://www.softwareadvice.com/",
    dr: 86,
    traffic: 2800000,
    niches: ["Technology & Software"],
    isPremium: true,
  },
  {
    name: "There's An AI For That",
    url: "https://theresanaiforthat.com/",
    dr: 71,
    traffic: 420000,
    niches: ["AI Assistants & Virtual Agents"],
  },
  {
    name: "AI Tools Directory",
    url: "https://aitoolsdirectory.com/",
    dr: 65,
    traffic: 180000,
    niches: ["AI Assistants & Virtual Agents"],
  },
  {
    name: "Indie Hackers",
    url: "https://www.indiehackers.com/products",
    dr: 86,
    traffic: 1200000,
    niches: ["Community", "Startups"],
  },
  {
    name: "BetaList",
    url: "https://betalist.com/",
    dr: 72,
    traffic: 350000,
    niches: ["Startups", "Early adopters"],
  },
];

export const list = query({
  args: {
    niche: v.optional(v.string()),
    minDr: v.optional(v.number()),
    maxDr: v.optional(v.number()),
    premiumOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("directories").collect();
    return items.filter((d) => {
      if (args.niche && !(d.niches ?? []).includes(args.niche)) return false;
      if (args.minDr && (d.dr ?? 0) < args.minDr) return false;
      if (args.maxDr && (d.dr ?? 0) > args.maxDr) return false;
      if (args.premiumOnly && d.isPremium !== true) return false;
      return true;
    });
  },
});

export const seedDefault = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("directories").collect();
    if (existing.length) return { inserted: 0 };
    for (const dir of starterDirectories) {
      await ctx.db.insert("directories", {
        name: dir.name,
        url: dir.url,
        dr: dir.dr,
        traffic: dir.traffic,
        niches: dir.niches,
        isPremium: dir.isPremium,
        notes: dir.notes,
        createdAt: now(),
        updatedAt: now(),
      });
    }
    return { inserted: starterDirectories.length };
  },
});


