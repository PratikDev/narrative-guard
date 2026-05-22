import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
} from "./_generated/server";
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
  score: z.number().min(0).max(100),
  verdict: z.enum(["on_brand", "needs_review", "off_brand"]),
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
    })
  ),
});

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildAuditPrompt(args: {
  brand: Doc<"brands">;
  contentType: Doc<"auditReports">["contentType"];
  content: string;
  ragContext: string;
}) {
  return `Evaluate the submitted content against the retrieved brand constitution.

Brand: ${args.brand.name}
Content type: ${args.contentType}

Retrieved brand constitution context:
${args.ragContext || "No relevant context was retrieved."}

Submitted content:
${args.content}

Scoring rules:
- Return a 0-100 score where 85-100 is on_brand, 65-84 is needs_review, and 0-64 is off_brand.
- Score only against the retrieved constitution context and the submitted content.
- Findings must quote exact submitted content in "sentence".
- Evidence must cite the relevant constitution rule or guidance from the retrieved context.
- Keep the rewrite suggestion publish-ready and aligned with the constitution.`;
}

export const createManualAudit = mutation({
  args: {
    brandId: v.id("brands"),
    contentType,
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const brand = await ctx.db.get(args.brandId);
    if (!brand) {
      throw new Error("Brand not found.");
    }
    if (brand.ragStatus !== "ready") {
      throw new Error("Brand constitution is still indexing.");
    }

    const now = Date.now();
    const content = args.content.trim();

    const reportId = await ctx.db.insert("auditReports", {
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
          contentType: audit.report.contentType,
          content: audit.report.originalContent,
          ragContext: context.text,
        }),
        output: Output.object({
          schema: auditResultSchema,
        }),
      });

      await ctx.runMutation(internal.audit.completeAudit, {
        reportId: args.reportId,
        ...result,
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
