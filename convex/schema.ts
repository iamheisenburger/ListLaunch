import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sites: defineTable({
    domain: v.string(),
    name: v.optional(v.string()),
    mainGoal: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_domain", ["domain"]),

  directories: defineTable({
    name: v.string(),
    url: v.string(),
    dr: v.optional(v.number()),
    traffic: v.optional(v.number()),
    niches: v.optional(v.array(v.string())),
    isPremium: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),

  directory_plans: defineTable({
    siteId: v.id("sites"),
    directoryId: v.id("directories"),
    priority: v.optional(v.number()),
    goal: v.optional(v.string()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_site", ["siteId"])
    .index("by_directory", ["directoryId"]),

  submission_packs: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_plan", ["planId"]),

  jobs: defineTable({
    type: v.string(),
    status: v.string(),
    payload: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"]),
});
