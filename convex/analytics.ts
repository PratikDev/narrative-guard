import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { query } from "./_generated/server";
import { requireAuthUserId } from "./lib/requireAuth";
import { resolveWorkspaceForQuery } from "./lib/workspaceAuth";

// ── Label maps (inline — cannot import from frontend lib/) ──────────────────
const VERDICT_LABELS: Record<string, string> = {
  on_brand: "On Brand",
  needs_review: "Needs Review",
  off_brand: "Off Brand",
};

const ISSUE_TYPE_LABELS: Record<string, string> = {
  mild_style: "Mild Style",
  hype_phrase: "Hype Phrase",
  banned_phrase: "Banned Phrase",
  absolute_claim: "Absolute Claim",
  direct_contradiction: "Direct Contradiction",
};

const SEVERITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  generic: "Generic",
  social_post: "Social Post",
  website_copy: "Website Copy",
  email: "Email",
  press_release: "Press Release",
  ad_copy: "Ad Copy",
};

const DIMENSION_LABELS: Record<string, string> = {
  toneAlignment: "Tone Alignment",
  messagingAlignment: "Messaging Alignment",
  bannedPhraseSafety: "Banned Phrase Safety",
  audienceFit: "Audience Fit",
  clarityAndTrust: "Clarity & Trust",
};

// ── Shared args ─────────────────────────────────────────────────────────────
const analyticsArgs = {
  workspaceId: v.optional(v.id("workspaces")),
  fromTs: v.optional(v.number()),
  toTs: v.optional(v.number()),
  brandId: v.optional(v.id("brands")),
  contentType: v.optional(v.string()),
  memberId: v.optional(v.id("users")),
};

// ── Shared helpers ──────────────────────────────────────────────────────────

function toDateKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function avg(values: number[]): number {
  return values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : 0;
}

function startOfUtcDay(ts: number): number {
  const date = new Date(ts);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function addUtcDays(ts: number, days: number): number {
  const date = new Date(ts);
  date.setUTCDate(date.getUTCDate() + days);
  return date.getTime();
}

function resolveBucketRange(
  reports: Doc<"auditReports">[],
  fromTs: number | undefined,
  toTs: number | undefined,
): { start: number; end: number } | null {
  if (reports.length === 0) return null;

  const reportTimes = reports.map((report) => report.createdAt);
  const minReportTs = Math.min(...reportTimes);
  const maxReportTs = Math.max(...reportTimes);

  return {
    start: startOfUtcDay(fromTs ?? minReportTs),
    end: startOfUtcDay(toTs ?? maxReportTs),
  };
}

function buildDailyBuckets(
  reports: Doc<"auditReports">[],
  fromTs: number | undefined,
  toTs: number | undefined,
): string[] {
  const range = resolveBucketRange(reports, fromTs, toTs);
  if (!range) return [];

  const buckets: string[] = [];
  for (let cursor = range.start; cursor <= range.end; cursor = addUtcDays(cursor, 1)) {
    buckets.push(toDateKey(cursor));
  }
  return buckets;
}

async function fetchFilteredReports(
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  fromTs: number | undefined,
  toTs: number | undefined,
  brandId: Id<"brands"> | undefined,
  contentType: string | undefined,
  memberId: Id<"users"> | undefined,
): Promise<Doc<"auditReports">[]> {
  const rows = await ctx.db
    .query("auditReports")
    .withIndex("by_workspace_created", (q) => {
      const base = q.eq("workspaceId", workspaceId);
      return fromTs !== undefined ? base.gte("createdAt", fromTs) : base;
    })
    .collect();

  return rows.filter(
    (r) =>
      r.status === "complete" &&
      (toTs === undefined || r.createdAt <= toTs) &&
      (!brandId || r.brandId === brandId) &&
      (!contentType || r.contentType === contentType) &&
      (!memberId || r.userId === memberId),
  );
}

async function fetchFindingsForReports(
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  fromTs: number | undefined,
  toTs: number | undefined,
  reportIds: Set<Id<"auditReports">>,
): Promise<Doc<"auditFindings">[]> {
  if (reportIds.size === 0) return [];
  const rows = await ctx.db
    .query("auditFindings")
    .withIndex("by_workspace_created", (q) => {
      const base = q.eq("workspaceId", workspaceId);
      return fromTs !== undefined ? base.gte("createdAt", fromTs) : base;
    })
    .collect();

  return rows.filter(
    (f) =>
      (toTs === undefined || f.createdAt <= toTs) &&
      reportIds.has(f.reportId),
  );
}

// ── Queries ─────────────────────────────────────────────────────────────────

export const getAnalyticsSummary = query({
  args: {
    ...analyticsArgs,
    prevFromTs: v.optional(v.number()),
    prevToTs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const membership = await resolveWorkspaceForQuery(ctx, userId, args.workspaceId);
    if (!membership) return null;
    const wid = membership.workspaceId;

    const reports = await fetchFilteredReports(ctx, wid, args.fromTs, args.toTs, args.brandId, args.contentType, args.memberId);
    const reportIds = new Set(reports.map((r) => r._id));
    const findings = await fetchFindingsForReports(ctx, wid, args.fromTs, args.toTs, reportIds);

    const buildSummary = (reps: typeof reports, fins: typeof findings) => ({
      totalAudits: reps.length,
      avgScore: avg(reps.map((r) => r.score)),
      onBrandCount: reps.filter((r) => r.verdict === "on_brand").length,
      needsReviewCount: reps.filter((r) => r.verdict === "needs_review").length,
      offBrandCount: reps.filter((r) => r.verdict === "off_brand").length,
      totalFindings: fins.length,
      activeBrands: new Set(reps.map((r) => r.brandId)).size,
      activeRunners: new Set(reps.map((r) => r.userId)).size,
    });

    const current = buildSummary(reports, findings);

    let prev: ReturnType<typeof buildSummary> | null = null;
    if (args.prevFromTs !== undefined && args.prevToTs !== undefined) {
      const prevReports = await fetchFilteredReports(ctx, wid, args.prevFromTs, args.prevToTs, args.brandId, args.contentType, args.memberId);
      const prevReportIds = new Set(prevReports.map((r) => r._id));
      const prevFindings = await fetchFindingsForReports(ctx, wid, args.prevFromTs, args.prevToTs, prevReportIds);
      prev = buildSummary(prevReports, prevFindings);
    }

    return { ...current, prev };
  },
});

export const getScoreTrend = query({
  args: analyticsArgs,
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const membership = await resolveWorkspaceForQuery(ctx, userId, args.workspaceId);
    if (!membership) return [];

    const reports = await fetchFilteredReports(ctx, membership.workspaceId, args.fromTs, args.toTs, args.brandId, args.contentType, args.memberId);

    const byDate = new Map<string, number[]>();
    for (const r of reports) {
      const key = toDateKey(r.createdAt);
      const arr = byDate.get(key) ?? [];
      arr.push(r.score);
      byDate.set(key, arr);
    }

    return buildDailyBuckets(reports, args.fromTs, args.toTs).map((date) => {
      const scores = byDate.get(date) ?? [];
      return {
        date,
        avgScore: scores.length ? avg(scores) : 0,
        count: scores.length,
      };
    });
  },
});

export const getAuditVolume = query({
  args: analyticsArgs,
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const membership = await resolveWorkspaceForQuery(ctx, userId, args.workspaceId);
    if (!membership) return [];

    const reports = await fetchFilteredReports(ctx, membership.workspaceId, args.fromTs, args.toTs, args.brandId, args.contentType, args.memberId);

    const byDate = new Map<string, number>();
    for (const r of reports) {
      const key = toDateKey(r.createdAt);
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
    }

    return buildDailyBuckets(reports, args.fromTs, args.toTs).map((date) => ({
      date,
      count: byDate.get(date) ?? 0,
    }));
  },
});

export const getVerdictDistribution = query({
  args: analyticsArgs,
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const membership = await resolveWorkspaceForQuery(ctx, userId, args.workspaceId);
    if (!membership) return [];

    const reports = await fetchFilteredReports(ctx, membership.workspaceId, args.fromTs, args.toTs, args.brandId, args.contentType, args.memberId);

    const counts: Record<string, number> = { on_brand: 0, needs_review: 0, off_brand: 0 };
    for (const r of reports) counts[r.verdict] = (counts[r.verdict] ?? 0) + 1;

    return (["on_brand", "needs_review", "off_brand"] as const).map((verdict) => ({
      verdict,
      label: VERDICT_LABELS[verdict],
      count: counts[verdict],
    }));
  },
});

export const getIssueTypeBreakdown = query({
  args: { ...analyticsArgs, severity: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const membership = await resolveWorkspaceForQuery(ctx, userId, args.workspaceId);
    if (!membership) return [];

    const reports = await fetchFilteredReports(ctx, membership.workspaceId, args.fromTs, args.toTs, args.brandId, args.contentType, args.memberId);
    const reportIds = new Set(reports.map((r) => r._id));
    const findings = await fetchFindingsForReports(ctx, membership.workspaceId, args.fromTs, args.toTs, reportIds);
    const filtered = findings.filter((f) => !args.severity || f.severity === args.severity);

    const counts = new Map<string, number>();
    for (const f of filtered) counts.set(f.issueType, (counts.get(f.issueType) ?? 0) + 1);

    return Array.from(counts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([issueType, count]) => ({
        issueType,
        label: ISSUE_TYPE_LABELS[issueType] ?? issueType,
        count,
      }));
  },
});

export const getSeverityBreakdown = query({
  args: { ...analyticsArgs, issueType: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const membership = await resolveWorkspaceForQuery(ctx, userId, args.workspaceId);
    if (!membership) return [];

    const reports = await fetchFilteredReports(ctx, membership.workspaceId, args.fromTs, args.toTs, args.brandId, args.contentType, args.memberId);
    const reportIds = new Set(reports.map((r) => r._id));
    const findings = await fetchFindingsForReports(ctx, membership.workspaceId, args.fromTs, args.toTs, reportIds);
    const filtered = findings.filter((f) => !args.issueType || f.issueType === args.issueType);

    const counts: Record<string, number> = { low: 0, medium: 0, high: 0 };
    for (const f of filtered) counts[f.severity] = (counts[f.severity] ?? 0) + 1;

    return (["low", "medium", "high"] as const).map((severity) => ({
      severity,
      label: SEVERITY_LABELS[severity],
      count: counts[severity],
    }));
  },
});

export const getContentTypePerformance = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    fromTs: v.optional(v.number()),
    toTs: v.optional(v.number()),
    brandId: v.optional(v.id("brands")),
    memberId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const membership = await resolveWorkspaceForQuery(ctx, userId, args.workspaceId);
    if (!membership) return [];

    const reports = await fetchFilteredReports(ctx, membership.workspaceId, args.fromTs, args.toTs, args.brandId, undefined, args.memberId);

    const grouped = new Map<string, number[]>();
    for (const r of reports) {
      const arr = grouped.get(r.contentType) ?? [];
      arr.push(r.score);
      grouped.set(r.contentType, arr);
    }

    return Array.from(grouped.entries()).map(([contentType, scores]) => ({
      contentType,
      label: CONTENT_TYPE_LABELS[contentType] ?? contentType,
      avgScore: avg(scores),
      count: scores.length,
    }));
  },
});

export const getBrandComparison = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    fromTs: v.optional(v.number()),
    toTs: v.optional(v.number()),
    contentType: v.optional(v.string()),
    memberId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const membership = await resolveWorkspaceForQuery(ctx, userId, args.workspaceId);
    if (!membership) return [];

    const reports = await fetchFilteredReports(ctx, membership.workspaceId, args.fromTs, args.toTs, undefined, args.contentType, args.memberId);

    const grouped = new Map<Id<"brands">, Doc<"auditReports">[]>();
    for (const r of reports) {
      const arr = grouped.get(r.brandId) ?? [];
      arr.push(r);
      grouped.set(r.brandId, arr);
    }

    const results = await Promise.all(
      Array.from(grouped.entries()).map(async ([brandId, reps]) => {
        const brand = await ctx.db.get(brandId);
        return {
          brandId: brandId as string,
          brandName: brand?.name ?? "Deleted brand",
          avgScore: avg(reps.map((r) => r.score)),
          auditCount: reps.length,
          offBrandCount: reps.filter((r) => r.verdict === "off_brand").length,
        };
      }),
    );

    return results.sort((a, b) => b.auditCount - a.auditCount);
  },
});

export const getScoreDimensionBreakdown = query({
  args: analyticsArgs,
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const membership = await resolveWorkspaceForQuery(ctx, userId, args.workspaceId);
    if (!membership) return [];

    const reports = await fetchFilteredReports(ctx, membership.workspaceId, args.fromTs, args.toTs, args.brandId, args.contentType, args.memberId);
    if (reports.length === 0) return [];

    const dims = ["toneAlignment", "messagingAlignment", "bannedPhraseSafety", "audienceFit", "clarityAndTrust"] as const;
    return dims.map((dim) => ({
      dimension: dim,
      label: DIMENSION_LABELS[dim],
      avgValue: avg(reports.map((r) => r[dim])),
    }));
  },
});

export const getMemberActivity = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    fromTs: v.optional(v.number()),
    toTs: v.optional(v.number()),
    brandId: v.optional(v.id("brands")),
    contentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const membership = await resolveWorkspaceForQuery(ctx, userId, args.workspaceId);
    if (!membership) return [];

    const reports = await fetchFilteredReports(ctx, membership.workspaceId, args.fromTs, args.toTs, args.brandId, args.contentType, undefined);

    const grouped = new Map<Id<"users">, Doc<"auditReports">[]>();
    for (const r of reports) {
      const arr = grouped.get(r.userId) ?? [];
      arr.push(r);
      grouped.set(r.userId, arr);
    }

    const results = await Promise.all(
      Array.from(grouped.entries()).map(async ([uid, reps]) => {
        const user = await ctx.db.get(uid);
        return {
          userId: uid as string,
          name: user?.name ?? null,
          email: user?.email ?? null,
          auditCount: reps.length,
          avgScore: avg(reps.map((r) => r.score)),
          offBrandCount: reps.filter((r) => r.verdict === "off_brand").length,
          lastAuditAt: Math.max(...reps.map((r) => r.createdAt)),
        };
      }),
    );

    return results.sort((a, b) => b.auditCount - a.auditCount);
  },
});

export const getRiskyAudits = query({
  args: {
    ...analyticsArgs,
    verdict: v.optional(v.string()),
    severity: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const membership = await resolveWorkspaceForQuery(ctx, userId, args.workspaceId);
    if (!membership) return [];

    const reports = await fetchFilteredReports(ctx, membership.workspaceId, args.fromTs, args.toTs, args.brandId, args.contentType, args.memberId);

    const risky = reports
      .filter((r) => r.verdict === "off_brand" || r.score <= 65)
      .filter((r) => !args.verdict || r.verdict === args.verdict)
      .sort((a, b) => a.score - b.score)
      .slice(0, args.limit ?? 100);

    if (risky.length === 0) return [];

    const riskyIds = new Set(risky.map((r) => r._id));
    const allFindings = await fetchFindingsForReports(ctx, membership.workspaceId, args.fromTs, args.toTs, riskyIds);

    const findingsByReport = new Map<Id<"auditReports">, Doc<"auditFindings">[]>();
    for (const f of allFindings) {
      const arr = findingsByReport.get(f.reportId) ?? [];
      arr.push(f);
      findingsByReport.set(f.reportId, arr);
    }

    const results = await Promise.all(
      risky.map(async (r) => {
        const findings = findingsByReport.get(r._id) ?? [];

        if (args.severity && !findings.some((f) => f.severity === args.severity)) return null;

        const brand = await ctx.db.get(r.brandId);
        const auditor = await ctx.db.get(r.userId);

        const typeCounts = new Map<string, number>();
        for (const f of findings) typeCounts.set(f.issueType, (typeCounts.get(f.issueType) ?? 0) + 1);
        const mainIssueType = typeCounts.size
          ? [...typeCounts.entries()].sort(([, a], [, b]) => b - a)[0][0]
          : null;

        return {
          reportId: r._id as string,
          date: r.createdAt,
          brandName: brand?.name ?? "Deleted brand",
          contentType: r.contentType,
          score: r.score,
          verdict: r.verdict,
          mainIssueType,
          findingsCount: findings.length,
          auditorName: auditor?.name ?? null,
          auditorEmail: auditor?.email ?? null,
        };
      }),
    );

    return results.filter((r) => r !== null);
  },
});
