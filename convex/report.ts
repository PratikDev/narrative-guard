import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { requireAuthUserId } from "./lib/requireAuth";
import {
	resolveWorkspaceForQuery,
	requireWorkspaceMember,
	requireWorkspaceRole,
} from "./lib/workspaceAuth";

function toUiReport(
	report: Doc<"auditReports">,
	brand: Doc<"brands"> | null,
	findings: Doc<"auditFindings">[],
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
			issueType: finding.issueType,
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
	reportId: Doc<"auditReports">["_id"],
	workspaceId: Doc<"workspaces">["_id"],
) {
	const findings = await ctx.db
		.query("auditFindings")
		.withIndex("by_report", (q) => q.eq("reportId", reportId))
		.collect();

	return findings.filter((finding) => finding.workspaceId === workspaceId);
}

export const listReports = query({
	args: {
		workspaceId: v.optional(v.id("workspaces")),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		const membership = await resolveWorkspaceForQuery(
			ctx,
			userId,
			args.workspaceId,
		);
		if (!membership) {
			return {
				page: [],
				isDone: true,
				continueCursor: "",
			};
		}

		const reports = await ctx.db
			.query("auditReports")
			.withIndex("by_workspace_created", (q) =>
				q.eq("workspaceId", membership.workspaceId),
			)
			.order("desc")
			.paginate(args.paginationOpts);

		const page = await Promise.all(
			reports.page.map(async (report) => {
				const brand = await ctx.db.get(report.brandId);
				const findings = await getFindingsByReport(
					ctx,
					report._id,
					membership.workspaceId,
				);
				return toUiReport(report, brand, findings);
			}),
		);

		return {
			...reports,
			page,
		};
	},
});

export const getReportWithFindings = query({
	args: {
		workspaceId: v.optional(v.id("workspaces")),
		reportId: v.id("auditReports"),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);

		const report = await ctx.db.get(args.reportId);
		if (!report) return null;
		if (args.workspaceId && report.workspaceId !== args.workspaceId) return null;
		await requireWorkspaceMember(ctx, report.workspaceId, userId);

		const brand = await ctx.db.get(report.brandId);
		const findings = await getFindingsByReport(
			ctx,
			report._id,
			report.workspaceId,
		);

		return toUiReport(report, brand, findings);
	},
});

export const deleteReport = mutation({
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
		await requireWorkspaceRole(ctx, report.workspaceId, userId, "admin");

		const findings = await ctx.db
			.query("auditFindings")
			.withIndex("by_report", (q) => q.eq("reportId", args.reportId))
			.collect();

		await Promise.all(
			findings
				.filter((finding) => finding.workspaceId === report.workspaceId)
				.map((finding) => ctx.db.delete(finding._id)),
		);

		await ctx.db.delete(report._id);

		return { reportId: report._id };
	},
});

export const getDashboardStats = query({
	args: {
		workspaceId: v.optional(v.id("workspaces")),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		const membership = await resolveWorkspaceForQuery(
			ctx,
			userId,
			args.workspaceId,
		);
		if (!membership) {
			return {
				totalReports: 0,
				averageScore: 0,
				needsReviewCount: 0,
				offBrandCount: 0,
				onBrandCount: 0,
			};
		}

		const reports = await ctx.db
			.query("auditReports")
			.withIndex("by_workspace_created", (q) =>
				q.eq("workspaceId", membership.workspaceId),
			)
			.collect();
		const completeReports = reports.filter(
			(report) => report.status === "complete",
		);
		const averageScore = completeReports.length
			? Math.round(
					completeReports.reduce((total, report) => total + report.score, 0) /
						completeReports.length,
				)
			: 0;

		return {
			totalReports: reports.length,
			averageScore,
			needsReviewCount: completeReports.filter(
				(report) => report.verdict === "needs_review",
			).length,
			offBrandCount: completeReports.filter(
				(report) => report.verdict === "off_brand",
			).length,
			onBrandCount: completeReports.filter(
				(report) => report.verdict === "on_brand",
			).length,
		};
	},
});

export const getBrandHealth = query({
	args: {
		workspaceId: v.optional(v.id("workspaces")),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		const membership = await resolveWorkspaceForQuery(
			ctx,
			userId,
			args.workspaceId,
		);
		if (!membership) return [];

		const brands = await ctx.db
			.query("brands")
			.withIndex("by_workspace", (q) =>
				q.eq("workspaceId", membership.workspaceId),
			)
			.collect();

		return await Promise.all(
			brands.map(async (brand) => {
				const reports = await ctx.db
					.query("auditReports")
					.withIndex("by_brand_created", (q) => q.eq("brandId", brand._id))
					.order("desc")
					.collect();
				const workspaceReports = reports.filter(
					(report) => report.workspaceId === membership.workspaceId,
				);

				const completeReports = workspaceReports.filter(
					(report) => report.status === "complete",
				);
				const averageScore = completeReports.length
					? Math.round(
							completeReports.reduce(
								(total, report) => total + report.score,
								0,
							) / completeReports.length,
						)
					: 0;

				return {
					brand: {
						id: brand._id,
						name: brand.name,
					},
					averageScore,
					latestReport: workspaceReports[0]
						? toUiReport(workspaceReports[0], brand, [])
						: null,
					reportCount: workspaceReports.length,
				};
			}),
		);
	},
});
