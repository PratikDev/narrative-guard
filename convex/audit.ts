import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
} from "./_generated/server";
import {
  calculateFinalAuditScore,
  clampScore,
  verdictFromScore,
} from "./lib/auditScoring";
import { getAuditContentTypePolicy } from "./lib/auditContentTypes";
import { buildAuditPrompt } from "./lib/auditPrompts";
import { requireAuthUserId } from "./lib/requireAuth";
import { brandNamespace, brandRag } from "./rag";

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

export const createManualAudit = mutation({
  args: {
    brandId: v.id("brands"),
    contentType,
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);

    const brand = await ctx.db.get(args.brandId);
    if (!brand || brand.userId !== userId) {
      throw new Error("Brand not found.");
    }
    if (brand.ragStatus !== "ready") {
      throw new Error("Brand constitution is still indexing.");
    }

    const now = Date.now();
    const content = args.content.trim();

    const reportId = await ctx.db.insert("auditReports", {
      userId,
      brandId: args.brandId,
      contentType: args.contentType,
      originalContent: content,
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

    await ctx.scheduler.runAfter(0, internal.audit.processManualAudit, {
      reportId,
    });

    return { reportId };
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
      })
    ),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return null;

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
        reportId: args.reportId,
        brandId: report.brandId,
        sentence: finding.sentence,
        reason: finding.reason,
        evidence: finding.evidence,
        severity: finding.severity,
        createdAt: now,
      });
    }

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

    await ctx.db.patch(args.reportId, {
      status: "failed",
      error: args.error,
      summary: "The audit failed before scoring completed.",
      updatedAt: Date.now(),
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
