import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const verdict = v.union(
  v.literal("on_brand"),
  v.literal("needs_review"),
  v.literal("off_brand")
);

const contentType = v.union(
  v.literal("generic"),
  v.literal("social_post"),
  v.literal("website_copy"),
  v.literal("email"),
  v.literal("press_release"),
  v.literal("ad_copy")
);

const auditStatus = v.union(
  v.literal("idle"),
  v.literal("processing"),
  v.literal("complete"),
  v.literal("failed")
);

const ragStatus = v.union(
  v.literal("not_indexed"),
  v.literal("indexing"),
  v.literal("ready"),
  v.literal("failed")
);

const findingSeverity = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high")
);

export const dimensionScores = v.object({
  toneAlignment: v.number(),
  messagingAlignment: v.number(),
  bannedPhraseSafety: v.number(),
  audienceFit: v.number(),
  clarityAndTrust: v.number(),
});

export default defineSchema({
  ...authTables,

  brands: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    constitution: v.string(),
    ragStatus: v.optional(ragStatus),
    ragError: v.optional(v.string()),
    ragEntryId: v.optional(v.string()),
    ragIndexedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  auditReports: defineTable({
    userId: v.optional(v.id("users")),
    brandId: v.id("brands"),
    contentType,
    originalContent: v.string(),

    score: v.number(),
    verdict,
    summary: v.string(),

    ...dimensionScores.fields,

    rewriteSuggestion: v.string(),
    status: auditStatus,
    error: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_brand_created", ["brandId", "createdAt"])
    .index("by_created", ["createdAt"])
    .index("by_verdict", ["verdict"])
    .index("by_user_verdict", ["userId", "verdict"])
    .index("by_brand_verdict", ["brandId", "verdict"]),

  auditFindings: defineTable({
    userId: v.optional(v.id("users")),
    reportId: v.id("auditReports"),
    brandId: v.id("brands"),
    sentence: v.string(),
    reason: v.string(),
    evidence: v.optional(v.string()),
    severity: findingSeverity,
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_report", ["reportId"])
    .index("by_brand", ["brandId"]),
});
