import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { query } from "./_generated/server";

function toUiReport(
  report: Doc<"auditReports">,
  brand: Doc<"brands"> | null,
  findings: Doc<"auditFindings">[]
) {
  return {
    id: report._id,
    brandId: report.brandId,
    brandName: brand?.name ?? "Deleted brand",
    contentType: report.contentType,
    originalContent: report.originalContent,
    score: report.score,
    verdict: report.verdict,
    summary: report.summary,
    dimensionScores: {
      toneAlignment: report.toneAlignment,
      messagingAlignment: report.messagingAlignment,
      bannedPhraseSafety: report.bannedPhraseSafety,
      audienceFit: report.audienceFit,
      clarityAndTrust: report.clarityAndTrust,
    },
    flaggedSentences: findings.map((finding) => ({
      id: finding._id,
      sentence: finding.sentence,
      reason: finding.reason,
      evidence: finding.evidence,
      severity: finding.severity,
    })),
    rewriteSuggestion: report.rewriteSuggestion,
    status: report.status,
    error: report.error,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

async function getFindingsByReport(
  ctx: QueryCtx,
  reportId: Doc<"auditReports">["_id"]
) {
  return await ctx.db
    .query("auditFindings")
    .withIndex("by_report", (q) => q.eq("reportId", reportId))
    .collect();
}

export const listReports = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db.query("auditReports").order("desc").collect();

    return await Promise.all(
      reports.map(async (report) => {
        const brand = await ctx.db.get(report.brandId);
        const findings = await getFindingsByReport(ctx, report._id);
        return toUiReport(report, brand, findings);
      })
    );
  },
});

export const getReportWithFindings = query({
  args: {
    reportId: v.id("auditReports"),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return null;

    const brand = await ctx.db.get(report.brandId);
    const findings = await getFindingsByReport(ctx, report._id);

    return toUiReport(report, brand, findings);
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db.query("auditReports").collect();
    const completeReports = reports.filter((report) => report.status === "complete");
    const averageScore = completeReports.length
      ? Math.round(
          completeReports.reduce((total, report) => total + report.score, 0) /
            completeReports.length
        )
      : 0;

    return {
      totalReports: reports.length,
      averageScore,
      needsReviewCount: completeReports.filter(
        (report) => report.verdict === "needs_review"
      ).length,
      offBrandCount: completeReports.filter(
        (report) => report.verdict === "off_brand"
      ).length,
      onBrandCount: completeReports.filter((report) => report.verdict === "on_brand")
        .length,
    };
  },
});

export const getBrandHealth = query({
  args: {},
  handler: async (ctx) => {
    const brands = await ctx.db.query("brands").collect();

    return await Promise.all(
      brands.map(async (brand) => {
        const reports = await ctx.db
          .query("auditReports")
          .withIndex("by_brand_created", (q) => q.eq("brandId", brand._id))
          .order("desc")
          .collect();

        const completeReports = reports.filter(
          (report) => report.status === "complete"
        );
        const averageScore = completeReports.length
          ? Math.round(
              completeReports.reduce((total, report) => total + report.score, 0) /
                completeReports.length
            )
          : 0;

        return {
          brand: {
            id: brand._id,
            name: brand.name,
          },
          averageScore,
          latestReport: reports[0]
            ? toUiReport(reports[0], brand, [])
            : null,
          reportCount: reports.length,
        };
      })
    );
  },
});
