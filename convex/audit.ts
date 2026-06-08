import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  type MutationCtx,
} from "./_generated/server";
import {
  calculateFinalAuditScore,
  clampScore,
  verdictFromScore,
} from "./lib/auditScoring";
import { getAuditContentTypePolicy } from "./lib/auditContentTypes";
import { buildAuditPrompt } from "./lib/auditPrompts";
import { createNotification } from "./lib/notificationHelpers";
import { requireAuthUserId } from "./lib/requireAuth";
import { requireWorkspaceMember } from "./lib/workspaceAuth";
import { brandNamespace, brandRag } from "./rag";
import { auditIssueType } from "./schema";

const contentType = v.union(
  v.literal("generic"),
  v.literal("social_post"),
  v.literal("website_copy"),
  v.literal("email"),
  v.literal("press_release"),
  v.literal("ad_copy")
);

const auditResultSchema = z.object({
  summary: z.string().min(1),
  toneAlignment: z.number().min(0).max(100),
  messagingAlignment: z.number().min(0).max(100),
  bannedPhraseSafety: z.number().min(0).max(100),
  audienceFit: z.number().min(0).max(100),
  clarityAndTrust: z.number().min(0).max(100),
  rewriteSuggestion: z.string().min(1),
  findings: z.array(
    z.object({
      sentence: z.string().min(1),
      reason: z.string().min(1),
      evidence: z.string().min(1),
      severity: z.enum(["low", "medium", "high"]),
      issueType: z.enum([
        "mild_style",
        "hype_phrase",
        "banned_phrase",
        "absolute_claim",
        "direct_contradiction",
      ]),
    })
  ),
});

export async function createProcessingAuditReport(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    workspaceId: Id<"workspaces">;
    brandId: Id<"brands">;
    contentType: Doc<"auditReports">["contentType"];
    originalContent: string;
    retryOfReportId?: Id<"auditReports">;
  }
) {
  const now = Date.now();
  const constitutionVersion = await ctx.db
    .query("brandConstitutionVersions")
    .withIndex("by_brand_and_version", (q) => q.eq("brandId", args.brandId))
    .order("desc")
    .first();

  return await ctx.db.insert("auditReports", {
    userId: args.userId,
    workspaceId: args.workspaceId,
    brandId: args.brandId,
    ...(constitutionVersion
      ? { brandConstitutionVersionId: constitutionVersion._id }
      : {}),
    ...(args.retryOfReportId ? { retryOfReportId: args.retryOfReportId } : {}),
    contentType: args.contentType,
    originalContent: args.originalContent,
    score: 0,
    verdict: "needs_review",
    summary: "Audit processing is underway.",
    toneAlignment: 0,
    messagingAlignment: 0,
    bannedPhraseSafety: 0,
    audienceFit: 0,
    clarityAndTrust: 0,
    rewriteSuggestion: "",
    status: "processing",
    createdAt: now,
    updatedAt: now,
  });
}

export const createManualAudit = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    brandId: v.id("brands"),
    contentType,
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
    if (brand.ragStatus !== "ready") {
      throw new Error("Brand constitution is still indexing.");
    }

    const content = args.content.trim();

    const reportId = await createProcessingAuditReport(ctx, {
      userId,
      workspaceId: brand.workspaceId,
      brandId: args.brandId,
      contentType: args.contentType,
      originalContent: content,
    });

    await ctx.scheduler.runAfter(0, internal.audit.processManualAudit, {
      reportId,
    });

    return { reportId };
  },
});

export const retryFailedAudit = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    reportId: v.id("auditReports"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const report = await ctx.db.get(args.reportId);

    if (!report) {
      throw new Error("Report not found.");
    }
    if (args.workspaceId && report.workspaceId !== args.workspaceId) {
      throw new Error("Report not found.");
    }
    await requireWorkspaceMember(ctx, report.workspaceId, userId);

    if (report.status !== "failed") {
      throw new Error("Only failed audits can be retried.");
    }

    const brand = await ctx.db.get(report.brandId);
    if (!brand || brand.workspaceId !== report.workspaceId) {
      throw new Error("Brand not found.");
    }
    if (brand.ragStatus !== "ready") {
      throw new Error("Brand constitution is still indexing.");
    }

    const retryReportId = await createProcessingAuditReport(ctx, {
      userId,
      workspaceId: report.workspaceId,
      brandId: report.brandId,
      contentType: report.contentType,
      originalContent: report.originalContent,
      retryOfReportId: report._id,
    });

    await ctx.scheduler.runAfter(0, internal.audit.processManualAudit, {
      reportId: retryReportId,
    });

    return { reportId: retryReportId };
  },
});

export const getAuditForProcessing = internalQuery({
  args: {
    reportId: v.id("auditReports"),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return null;

    const brand = await ctx.db.get(report.brandId);
    if (!brand) return null;
    if (brand.workspaceId !== report.workspaceId) return null;

    return { report, brand };
  },
});

export const completeAudit = internalMutation({
  args: {
    reportId: v.id("auditReports"),
    score: v.number(),
    verdict: v.union(
      v.literal("on_brand"),
      v.literal("needs_review"),
      v.literal("off_brand")
    ),
    summary: v.string(),
    toneAlignment: v.number(),
    messagingAlignment: v.number(),
    bannedPhraseSafety: v.number(),
    audienceFit: v.number(),
    clarityAndTrust: v.number(),
    rewriteSuggestion: v.string(),
    findings: v.array(
      v.object({
        sentence: v.string(),
        reason: v.string(),
        evidence: v.string(),
        severity: v.union(
          v.literal("low"),
          v.literal("medium"),
          v.literal("high")
        ),
        issueType: auditIssueType,
      })
    ),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return null;
    const brand = await ctx.db.get(report.brandId);

    const now = Date.now();
    await ctx.db.patch(args.reportId, {
      score: clampScore(args.score),
      verdict: args.verdict,
      summary: args.summary,
      toneAlignment: clampScore(args.toneAlignment),
      messagingAlignment: clampScore(args.messagingAlignment),
      bannedPhraseSafety: clampScore(args.bannedPhraseSafety),
      audienceFit: clampScore(args.audienceFit),
      clarityAndTrust: clampScore(args.clarityAndTrust),
      rewriteSuggestion: args.rewriteSuggestion,
      status: "complete",
      error: undefined,
      updatedAt: now,
    });

    for (const finding of args.findings) {
      await ctx.db.insert("auditFindings", {
        userId: report.userId,
        workspaceId: report.workspaceId,
        reportId: args.reportId,
        brandId: report.brandId,
        sentence: finding.sentence,
        reason: finding.reason,
        evidence: finding.evidence,
        severity: finding.severity,
        issueType: finding.issueType,
        createdAt: now,
      });
    }

    await createNotification(ctx, {
      userId: report.userId,
      workspaceId: report.workspaceId,
      brandId: report.brandId,
      reportId: args.reportId,
      scope: "user",
      type: "audit_completed",
      title: "Audit completed",
      message: `${brand?.name ?? "Your brand"} audit finished with a ${clampScore(args.score)}/100 score.`,
      createdAt: now,
    });

    return null;
  },
});

export const failAudit = internalMutation({
  args: {
    reportId: v.id("auditReports"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return null;
    const brand = await ctx.db.get(report.brandId);
    const now = Date.now();

    await ctx.db.patch(args.reportId, {
      status: "failed",
      error: args.error,
      summary: "The audit failed before scoring completed.",
      updatedAt: now,
    });

    await createNotification(ctx, {
      userId: report.userId,
      workspaceId: report.workspaceId,
      brandId: report.brandId,
      reportId: args.reportId,
      scope: "user",
      type: "audit_failed",
      title: "Audit failed",
      message: `${brand?.name ?? "Your brand"} audit failed before scoring completed.`,
      createdAt: now,
    });

    return null;
  },
});

export const processManualAudit = internalAction({
  args: {
    reportId: v.id("auditReports"),
  },
  handler: async (ctx, args) => {
    const audit = await ctx.runQuery(internal.audit.getAuditForProcessing, {
      reportId: args.reportId,
    });

    if (!audit) return null;

    try {
      const contentTypePolicy = getAuditContentTypePolicy(
        audit.report.contentType
      );
      const context = await brandRag.search(ctx, {
        namespace: brandNamespace(audit.brand._id),
        query: audit.report.originalContent,
        searchType: "hybrid",
        limit: 8,
        chunkContext: { before: 1, after: 1 },
      });

      const { output: result } = await generateText({
        model: google.chat("gemini-2.5-flash"),
        temperature: 0.2,
        prompt: buildAuditPrompt({
          brand: audit.brand,
          contentTypePolicy,
          content: audit.report.originalContent,
          ragContext: context.text,
        }),
        output: Output.object({
          schema: auditResultSchema,
        }),
      });
      const dimensions = {
        toneAlignment: result.toneAlignment,
        messagingAlignment: result.messagingAlignment,
        bannedPhraseSafety: result.bannedPhraseSafety,
        audienceFit: result.audienceFit,
        clarityAndTrust: result.clarityAndTrust,
      };
      const score = calculateFinalAuditScore({
        dimensions,
        findings: result.findings,
        scoringWeights: contentTypePolicy.scoringWeights,
        penaltyMultipliers: contentTypePolicy.penaltyMultipliers,
        scoreCaps: contentTypePolicy.scoreCaps,
      });

      await ctx.runMutation(internal.audit.completeAudit, {
        reportId: args.reportId,
        score,
        verdict: verdictFromScore(score),
        summary: result.summary,
        toneAlignment: result.toneAlignment,
        messagingAlignment: result.messagingAlignment,
        bannedPhraseSafety: result.bannedPhraseSafety,
        audienceFit: result.audienceFit,
        clarityAndTrust: result.clarityAndTrust,
        rewriteSuggestion: result.rewriteSuggestion,
        findings: result.findings.map((finding) => ({
          sentence: finding.sentence,
          reason: finding.reason,
          evidence: finding.evidence,
          severity: finding.severity,
          issueType: finding.issueType,
        })),
      });
    } catch (error) {
      await ctx.runMutation(internal.audit.failAudit, {
        reportId: args.reportId,
        error: error instanceof Error ? error.message : "Audit processing failed.",
      });
    }

    return null;
  },
});
