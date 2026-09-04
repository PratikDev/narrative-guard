/// <reference types="vite/client" />
// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";
import {
	addMember,
	asUser,
	createReadyBrand,
	createUser,
	createWorkspaceWithOwner,
	insertFinding,
	insertReport,
} from "./test/seed";

const modules = import.meta.glob("./**/*.ts");

async function setup() {
	const t = convexTest(schema, modules);
	const ownerId = await createUser(t, { name: "Owner", email: "owner@example.com" });
	const workspaceId = await createWorkspaceWithOwner(t, ownerId);
	const brandId = await createReadyBrand(t, workspaceId, ownerId);
	return { t, ownerId, workspaceId, brandId };
}

describe("deleteReport", () => {
	it("requires at least an admin role", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		const memberId = await createUser(t, { email: "member@example.com" });
		await addMember(t, workspaceId, memberId, "member");
		const reportId = await insertReport(t, { userId: ownerId, workspaceId, brandId });

		await expect(
			asUser(t, memberId).mutation(api.report.deleteReport, {
				workspaceId,
				reportId,
			}),
		).rejects.toThrow();
	});

	it("deletes the report and cascades its findings", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		const reportId = await insertReport(t, { userId: ownerId, workspaceId, brandId });
		await insertFinding(t, { userId: ownerId, workspaceId, brandId, reportId });
		await insertFinding(t, { userId: ownerId, workspaceId, brandId, reportId });

		await asUser(t, ownerId).mutation(api.report.deleteReport, {
			workspaceId,
			reportId,
		});

		expect(await t.run((ctx) => ctx.db.get(reportId))).toBeNull();
		const remainingFindings = await t.run((ctx) =>
			ctx.db
				.query("auditFindings")
				.withIndex("by_report", (q) => q.eq("reportId", reportId))
				.collect(),
		);
		expect(remainingFindings).toHaveLength(0);
	});
});

describe("getReportWithFindings", () => {
	it("returns null when the report belongs to a different workspace", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		const reportId = await insertReport(t, { userId: ownerId, workspaceId, brandId });
		const otherWorkspaceId = await createWorkspaceWithOwner(t, ownerId, "Other");

		const result = await asUser(t, ownerId).query(api.report.getReportWithFindings, {
			workspaceId: otherWorkspaceId,
			reportId,
		});
		expect(result).toBeNull();
	});

	it("throws for a user who is not a workspace member", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		const reportId = await insertReport(t, { userId: ownerId, workspaceId, brandId });
		const outsiderId = await createUser(t, { email: "outsider@example.com" });

		await expect(
			asUser(t, outsiderId).query(api.report.getReportWithFindings, { reportId }),
		).rejects.toThrow();
	});

	it("includes only findings scoped to the report's workspace", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		const reportId = await insertReport(t, { userId: ownerId, workspaceId, brandId });
		await insertFinding(t, { userId: ownerId, workspaceId, brandId, reportId });

		const result = await asUser(t, ownerId).query(api.report.getReportWithFindings, {
			workspaceId,
			reportId,
		});
		expect(result?.flaggedSentences).toHaveLength(1);
		expect(result?.brandId).toBe(brandId);
	});
});

describe("getDashboardStats", () => {
	it("returns all zeros for a workspace with no reports", async () => {
		const { t, ownerId, workspaceId } = await setup();

		const stats = await asUser(t, ownerId).query(api.report.getDashboardStats, {
			workspaceId,
		});
		expect(stats).toEqual({
			totalReports: 0,
			averageScore: 0,
			needsReviewCount: 0,
			offBrandCount: 0,
			onBrandCount: 0,
		});
	});

	it("averages scores and counts verdicts across completed reports only", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		await insertReport(t, {
			userId: ownerId,
			workspaceId,
			brandId,
			status: "complete",
			verdict: "on_brand",
			score: 90,
		});
		await insertReport(t, {
			userId: ownerId,
			workspaceId,
			brandId,
			status: "complete",
			verdict: "off_brand",
			score: 30,
		});
		await insertReport(t, {
			userId: ownerId,
			workspaceId,
			brandId,
			status: "processing",
			score: 0,
		});

		const stats = await asUser(t, ownerId).query(api.report.getDashboardStats, {
			workspaceId,
		});
		expect(stats.totalReports).toBe(3);
		expect(stats.averageScore).toBe(60); // (90 + 30) / 2, processing report excluded
		expect(stats.onBrandCount).toBe(1);
		expect(stats.offBrandCount).toBe(1);
		expect(stats.needsReviewCount).toBe(0);
	});
});

describe("getBrandHealth", () => {
	it("reports the average score and latest report per brand", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		await insertReport(t, {
			userId: ownerId,
			workspaceId,
			brandId,
			score: 70,
			createdAt: 1_000,
			updatedAt: 1_000,
		});
		const latestId = await insertReport(t, {
			userId: ownerId,
			workspaceId,
			brandId,
			score: 90,
			createdAt: 2_000,
			updatedAt: 2_000,
		});

		const health = await asUser(t, ownerId).query(api.report.getBrandHealth, {
			workspaceId,
		});
		expect(health).toHaveLength(1);
		expect(health[0]?.averageScore).toBe(80);
		expect(health[0]?.reportCount).toBe(2);
		expect(health[0]?.latestReport?.id).toBe(latestId);
	});

	it("returns an empty list for a brand-less workspace", async () => {
		const { t, ownerId } = await setup();
		const emptyWorkspaceId = await createWorkspaceWithOwner(t, ownerId, "Empty");

		const health = await asUser(t, ownerId).query(api.report.getBrandHealth, {
			workspaceId: emptyWorkspaceId,
		});
		expect(health).toEqual([]);
	});
});
