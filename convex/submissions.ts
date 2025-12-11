import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { z } from "zod";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const defaultModel = "gpt-5-mini-2025-08-07";

const PackSchema = z.object({
  title: z.string(),
  tagline: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  utmUrl: z.string().optional(),
  cta: z.string().optional(),
  extraFields: z.record(z.string(), z.string()).optional(),
});

const parseJson = <T>(schema: z.ZodTypeAny, text: string): T => {
  const startCandidates = [text.indexOf("{"), text.indexOf("[")].filter(
    (v) => v >= 0,
  );
  const start =
    startCandidates.length > 0
      ? Math.min(...startCandidates)
      : 0;
  const raw = text.slice(start).trim();
  return schema.parse(JSON.parse(raw)) as T;
};

const now = () => Date.now();

type PackRecord = {
  _id: Id<"submission_packs">;
  planId: Id<"directory_plans">;
} & z.infer<typeof PackSchema>;

export const getByPlan = query({
  args: { planId: v.id("directory_plans") },
  handler: async (ctx, { planId }) => {
    return await ctx.db
      .query("submission_packs")
      .withIndex("by_plan", (q) => q.eq("planId", planId))
      .unique();
  },
});

export const planDetails = query({
  args: { planId: v.id("directory_plans") },
  handler: async (ctx, { planId }) => {
    const plan = await ctx.db.get(planId);
    if (!plan) throw new Error("Plan not found");
    const directory = await ctx.db.get(plan.directoryId as Id<"directories">);
    const site = await ctx.db.get(plan.siteId as Id<"sites">);
    if (!directory) throw new Error("Directory not found");
    if (!site) throw new Error("Site not found");
    return { plan, directory, site };
  },
});

export const savePack = mutation({
  args: {
    planId: v.id("directory_plans"),
    title: v.string(),
    tagline: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    longDescription: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    utmUrl: v.optional(v.string()),
    cta: v.optional(v.string()),
    extraFields: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("submission_packs")
      .withIndex("by_plan", (q) => q.eq("planId", args.planId))
      .unique();

    if (existing?._id) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("submission_packs", {
      ...args,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});

export const generatePack = action({
  args: { planId: v.id("directory_plans") },
  handler: async (
    ctx,
    { planId },
  ): Promise<PackRecord> => {
    const existing = await ctx.runQuery(api.submissions.getByPlan, { planId });
    if (existing) {
      return {
        _id: existing._id as Id<"submission_packs">,
        planId,
        title: existing.title,
        tagline: existing.tagline ?? undefined,
        shortDescription: existing.shortDescription ?? undefined,
        longDescription: existing.longDescription ?? undefined,
        categories: existing.categories ?? undefined,
        tags: existing.tags ?? undefined,
        utmUrl: existing.utmUrl ?? undefined,
        cta: existing.cta ?? undefined,
        extraFields: existing.extraFields ?? undefined,
      };
    }

    const { plan, directory, site } = await ctx.runQuery(
      api.submissions.planDetails,
      { planId },
    );

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not set");
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.responses.create({
      model: defaultModel,
      input: [
        {
          role: "system",
          content:
            "You craft concise directory submission copy. Return JSON only.",
        },
        {
          role: "user",
          content: `Site: ${site.domain}
Goal: ${plan.goal ?? "DR"}
Directory: ${directory.name} (${directory.url})
Niche tags: ${(directory.niches ?? []).join(", ")}
Requested fields: title, tagline, shortDescription, longDescription, categories, tags, utmUrl, cta, extraFields (key/value).
Use a UTM URL if possible (utm_source=${directory.name
            .toLowerCase()
            .replace(/\\s+/g, "-")}).`,
        },
      ],
    });

    const pack = parseJson<z.infer<typeof PackSchema>>(
      PackSchema,
      completion.output_text,
    );

    const id = await ctx.runMutation(api.submissions.savePack, {
      planId,
      ...pack,
    });

    return { _id: id as Id<"submission_packs">, planId, ...pack };
  },
});

