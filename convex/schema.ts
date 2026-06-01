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

export const workspaceRole = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("member")
);

const workspaceMemberStatus = v.union(
  v.literal("active"),
  v.literal("removed")
);

const workspaceInviteRole = v.union(v.literal("admin"), v.literal("member"));

const workspaceInviteStatus = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("declined"),
  v.literal("revoked"),
  v.literal("expired")
);

const notificationScope = v.union(
  v.literal("user"),
  v.literal("workspace")
);

const notificationType = v.union(
  v.literal("audit_completed"),
  v.literal("audit_failed"),
  v.literal("workspace_invitation_received"),
  v.literal("workspace_invitation_accepted"),
  v.literal("workspace_role_changed")
);

export const auditIssueType = v.union(
  v.literal("mild_style"),
  v.literal("hype_phrase"),
  v.literal("banned_phrase"),
  v.literal("absolute_claim"),
  v.literal("direct_contradiction")
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

  workspaces: defineTable({
    name: v.string(),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_created_by_user", ["createdByUserId"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: workspaceRole,
    status: workspaceMemberStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_workspace_and_user", ["workspaceId", "userId"]),

  workspaceInvites: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: workspaceInviteRole,
    tokenHash: v.string(),
    status: workspaceInviteStatus,
    invitedByUserId: v.id("users"),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_token_hash", ["tokenHash"])
    .index("by_workspace", ["workspaceId"])
    .index("by_email", ["email"]),

  brands: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    name: v.string(),
    constitution: v.string(),
    ragStatus: v.optional(ragStatus),
    ragError: v.optional(v.string()),
    ragEntryId: v.optional(v.string()),
    ragIndexedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_updated", ["workspaceId", "updatedAt"]),

  auditReports: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
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
    .index("by_workspace_created", ["workspaceId", "createdAt"])
    .index("by_brand_created", ["brandId", "createdAt"])
    .index("by_created", ["createdAt"])
    .index("by_verdict", ["verdict"])
    .index("by_user_verdict", ["userId", "verdict"])
    .index("by_workspace_verdict", ["workspaceId", "verdict"])
    .index("by_brand_verdict", ["brandId", "verdict"]),

  auditFindings: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    reportId: v.id("auditReports"),
    brandId: v.id("brands"),
    sentence: v.string(),
    reason: v.string(),
    evidence: v.optional(v.string()),
    severity: findingSeverity,
    issueType: auditIssueType,
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_brand", ["brandId"]),

  notifications: defineTable({
    userId: v.id("users"),
    actorUserId: v.optional(v.id("users")),
    workspaceId: v.optional(v.id("workspaces")),
    brandId: v.optional(v.id("brands")),
    reportId: v.optional(v.id("auditReports")),
    inviteId: v.optional(v.id("workspaceInvites")),
    scope: notificationScope,
    type: notificationType,
    title: v.string(),
    message: v.string(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user_and_created_at", ["userId", "createdAt"])
    .index("by_user_and_read_at_and_created_at", [
      "userId",
      "readAt",
      "createdAt",
    ])
    .index("by_user_and_invite", ["userId", "inviteId"])
    .index("by_workspace_and_created_at", ["workspaceId", "createdAt"]),
});
