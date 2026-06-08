import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { createProcessingAuditReport } from "./audit";
import { requireAuthUserId } from "./lib/requireAuth";
import {
  requireWorkspaceMember,
  resolveWorkspaceForQuery,
} from "./lib/workspaceAuth";

const contentType = v.union(
  v.literal("generic"),
  v.literal("social_post"),
  v.literal("website_copy"),
  v.literal("email"),
  v.literal("press_release"),
  v.literal("ad_copy")
);

type DraftCtx = QueryCtx | MutationCtx;
type AuditDraft = Doc<"auditDrafts">;

async function getCreatorInfo(ctx: DraftCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);

  return {
    id: userId,
    name: user?.name ?? null,
    email: user?.email ?? null,
  };
}

async function enrichDraft(ctx: DraftCtx, draft: AuditDraft) {
  const [brand, creator] = await Promise.all([
    ctx.db.get(draft.brandId),
    getCreatorInfo(ctx, draft.userId),
  ]);

  return {
    _id: draft._id,
    workspaceId: draft.workspaceId,
    brandId: draft.brandId,
    userId: draft.userId,
    title: draft.title,
    contentType: draft.contentType,
    content: draft.content,
    status: draft.status,
    reportId: draft.reportId,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    brandName: brand?.name ?? "Unknown brand",
    creator,
  };
}

async function listDraftsForWorkspace(
  ctx: QueryCtx,
  args: { workspaceId?: Id<"workspaces">; limit: number }
) {
  const userId = await requireAuthUserId(ctx);
  const membership = await resolveWorkspaceForQuery(ctx, userId, args.workspaceId);

  if (!membership) return [];

  const drafts = await ctx.db
    .query("auditDrafts")
    .withIndex("by_workspace_and_status_and_updated", (q) =>
      q.eq("workspaceId", membership.workspaceId).eq("status", "draft")
    )
    .order("desc")
    .take(args.limit);

  return await Promise.all(drafts.map((draft) => enrichDraft(ctx, draft)));
}

function validateDraftContent(args: { title: string; content: string }) {
  const title = args.title.trim();
  const content = args.content.trim();

  if (!title) {
    throw new Error("Draft title is required.");
  }
  if (!content) {
    throw new Error("Draft content is required.");
  }

  return { title, content };
}

async function getWorkspaceBrand(
  ctx: DraftCtx,
  brandId: Id<"brands">,
  workspaceId: Id<"workspaces">
) {
  const brand = await ctx.db.get(brandId);

  if (!brand || brand.workspaceId !== workspaceId) {
    throw new Error("Brand not found.");
  }

  return brand;
}

export const listWorkspaceDrafts = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    return await listDraftsForWorkspace(ctx, { ...args, limit: 25 });
  },
});

export const listDashboardDrafts = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    return await listDraftsForWorkspace(ctx, { ...args, limit: 5 });
  },
});

export const getDraftForEditing = query({
  args: {
    draftId: v.id("auditDrafts"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const draft = await ctx.db.get(args.draftId);

    if (!draft || draft.status !== "draft") {
      return null;
    }

    await requireWorkspaceMember(ctx, draft.workspaceId, userId);

    return await enrichDraft(ctx, draft);
  },
});

export const createDraft = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    brandId: v.id("brands"),
    contentType,
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const brand = await ctx.db.get(args.brandId);

    if (!brand) {
      throw new Error("Brand not found.");
    }
    if (args.workspaceId && brand.workspaceId !== args.workspaceId) {
      throw new Error("Brand not found.");
    }

    await requireWorkspaceMember(ctx, brand.workspaceId, userId);
    const { title, content } = validateDraftContent(args);
    const now = Date.now();

    return await ctx.db.insert("auditDrafts", {
      workspaceId: brand.workspaceId,
      brandId: args.brandId,
      userId,
      title,
      contentType: args.contentType,
      content,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateDraft = mutation({
  args: {
    draftId: v.id("auditDrafts"),
    brandId: v.id("brands"),
    contentType,
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const draft = await ctx.db.get(args.draftId);

    if (!draft) {
      throw new Error("Draft not found.");
    }
    if (draft.status !== "draft") {
      throw new Error("Only active drafts can be updated.");
    }

    await requireWorkspaceMember(ctx, draft.workspaceId, userId);
    await getWorkspaceBrand(ctx, args.brandId, draft.workspaceId);
    const { title, content } = validateDraftContent(args);

    await ctx.db.patch(args.draftId, {
      brandId: args.brandId,
      contentType: args.contentType,
      title,
      content,
      updatedAt: Date.now(),
    });

    return args.draftId;
  },
});

export const discardDraft = mutation({
  args: {
    draftId: v.id("auditDrafts"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const draft = await ctx.db.get(args.draftId);

    if (!draft) {
      throw new Error("Draft not found.");
    }
    if (draft.status !== "draft") {
      throw new Error("Only active drafts can be discarded.");
    }

    await requireWorkspaceMember(ctx, draft.workspaceId, userId);
    await ctx.db.patch(args.draftId, {
      status: "discarded",
      updatedAt: Date.now(),
    });

    return args.draftId;
  },
});

export const runDraftAudit = mutation({
  args: {
    draftId: v.id("auditDrafts"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const draft = await ctx.db.get(args.draftId);

    if (!draft) {
      throw new Error("Draft not found.");
    }
    if (draft.status !== "draft") {
      throw new Error("Only active drafts can be audited.");
    }

    await requireWorkspaceMember(ctx, draft.workspaceId, userId);
    const brand = await getWorkspaceBrand(ctx, draft.brandId, draft.workspaceId);
    if (brand.ragStatus !== "ready") {
      throw new Error("Brand constitution is still indexing.");
    }

    const reportId = await createProcessingAuditReport(ctx, {
      userId,
      workspaceId: draft.workspaceId,
      brandId: draft.brandId,
      contentType: draft.contentType,
      originalContent: draft.content,
    });

    await ctx.scheduler.runAfter(0, internal.audit.processManualAudit, {
      reportId,
    });

    await ctx.db.patch(args.draftId, {
      status: "audited",
      reportId,
      updatedAt: Date.now(),
    });

    return { reportId };
  },
});
