/// <reference types="vite/client" />
// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";
import {
	asUser,
	createReadyBrand,
	createUser,
	createWorkspaceWithOwner,
	insertFinding,
	insertReport,
} from "./test/seed";

const modules = import.meta.glob("./**/*.ts");

// All analytics queries share the same fetchFilteredReports /
// fetchFindingsForReports / buildDailyBuckets helpers in convex/analytics.ts,
// so this suite seeds one dataset and exercises a representative subset of
// the queries rather than duplicating the same date/filter checks per query.

const DAY1 = Date.UTC(2026, 0, 1, 10, 0, 0); // in range
const DAY2 = Date.UTC(2026, 0, 2, 10, 0, 0); // in range
const OUT_OF_RANGE = Date.UTC(2025, 11, 31, 10, 0, 0); // before the range
const FROM_TS = Date.UTC(2026, 0, 1);
const TO_TS = Date.UTC(2026, 0, 3, 23, 59, 59, 999); // 3-day window, day 3 has no data
const PREV_FROM_TS = Date.UTC(2025, 11, 29);
const PREV_TO_TS = Date.UTC(2025, 11, 31, 23, 59, 59, 999);

async function seedDataset() {
	const t = convexTest(schema, modules);
	const ownerId = await createUser(t, { name: "Owner", email: "owner@example.com" });
	const workspaceId = await createWorkspaceWithOwner(t, ownerId);
	const brandA = await createReadyBrand(t, workspaceId, ownerId, { name: "Brand A" });
	const brandB = await createReadyBrand(t, workspaceId, ownerId, { name: "Brand B" });

	const reportA1 = await insertReport(t, {
		userId: ownerId,
		workspaceId,
		brandId: brandA,
		score: 90,
		verdict: "on_brand",
		contentType: "email",
		createdAt: DAY1,
		updatedAt: DAY1,
	});
	const reportA2 = await insertReport(t, {
		userId: ownerId,
		workspaceId,
		brandId: brandA,
		score: 40,
		verdict: "off_brand",
		contentType: "ad_copy",
		createdAt: DAY2,
		updatedAt: DAY2,
	});
	const reportB1 = await insertReport(t, {
		userId: ownerId,
		workspaceId,
		brandId: brandB,
		score: 70,
		verdict: "needs_review",
		contentType: "email",
		createdAt: DAY1,
		updatedAt: DAY1,
	});
	const outOfRangeReport = await insertReport(t, {
		userId: ownerId,
		workspaceId,
		brandId: brandA,
		score: 10,
		verdict: "off_brand",
		createdAt: OUT_OF_RANGE,
		updatedAt: OUT_OF_RANGE,
	});
	await insertFinding(t, {
		userId: ownerId,
		workspaceId,
		brandId: brandA,
		reportId: reportA2,
		issueType: "banned_phrase",
		severity: "high",
		// Findings are filtered by their own createdAt, not the report's.
		createdAt: DAY2,
	});

	return {
		t,
		ownerId,
		workspaceId,
		brandA,
		brandB,
		reportA1,
		reportA2,
		reportB1,
		outOfRangeReport,
	};
}

describe("getAnalyticsSummary", () => {
	it("aggregates the current range and compares against the previous one", async () => {
		const { t, ownerId, workspaceId } = await seedDataset();

		const summary = await asUser(t, ownerId).query(api.analytics.getAnalyticsSummary, {
			workspaceId,
			fromTs: FROM_TS,
			toTs: TO_TS,
			prevFromTs: PREV_FROM_TS,
			prevToTs: PREV_TO_TS,
		});

		expect(summary?.totalAudits).toBe(3);
		expect(summary?.avgScore).toBe(67); // round((90 + 40 + 70) / 3)
		expect(summary?.onBrandCount).toBe(1);
		expect(summary?.needsReviewCount).toBe(1);
		expect(summary?.offBrandCount).toBe(1);
		expect(summary?.totalFindings).toBe(1);
		expect(summary?.activeBrands).toBe(2);
		expect(summary?.prev).toMatchObject({ totalAudits: 1, avgScore: 10, offBrandCount: 1 });
	});

	it("returns null for a user with no workspace", async () => {
		const t = convexTest(schema, modules);
		const userId = await createUser(t);

		const summary = await asUser(t, userId).query(api.analytics.getAnalyticsSummary, {});
		expect(summary).toBeNull();
	});
});

describe("getScoreTrend", () => {
	it("fills every day in the range, including days with no reports", async () => {
		const { t, ownerId, workspaceId } = await seedDataset();

		const trend = await asUser(t, ownerId).query(api.analytics.getScoreTrend, {
			workspaceId,
			fromTs: FROM_TS,
			toTs: TO_TS,
		});

		expect(trend.map((p) => p.date)).toEqual(["2026-01-01", "2026-01-02", "2026-01-03"]);
		expect(trend[0]).toMatchObject({ avgScore: 80, count: 2 }); // (90 + 70) / 2
		expect(trend[1]).toMatchObject({ avgScore: 40, count: 1 });
		expect(trend[2]).toMatchObject({ avgScore: 0, count: 0 });
	});
});

describe("getVerdictDistribution", () => {
	it("counts each verdict within the range and excludes reports outside it", async () => {
		const { t, ownerId, workspaceId } = await seedDataset();

		const distribution = await asUser(t, ownerId).query(
			api.analytics.getVerdictDistribution,
			{ workspaceId, fromTs: FROM_TS, toTs: TO_TS },
		);

		expect(distribution).toEqual([
			{ verdict: "on_brand", label: "On Brand", count: 1 },
			{ verdict: "needs_review", label: "Needs Review", count: 1 },
			{ verdict: "off_brand", label: "Off Brand", count: 1 },
		]);
	});

	it("filters by brand", async () => {
		const { t, ownerId, workspaceId, brandA } = await seedDataset();

		const distribution = await asUser(t, ownerId).query(
			api.analytics.getVerdictDistribution,
			{ workspaceId, fromTs: FROM_TS, toTs: TO_TS, brandId: brandA },
		);

		expect(distribution.find((d) => d.verdict === "on_brand")?.count).toBe(1);
		expect(distribution.find((d) => d.verdict === "needs_review")?.count).toBe(0);
		expect(distribution.find((d) => d.verdict === "off_brand")?.count).toBe(1);
	});
});

describe("getContentTypePerformance", () => {
	it("groups average score by content type", async () => {
		const { t, ownerId, workspaceId } = await seedDataset();

		const performance = await asUser(t, ownerId).query(
			api.analytics.getContentTypePerformance,
			{ workspaceId, fromTs: FROM_TS, toTs: TO_TS },
		);

		const email = performance.find((p) => p.contentType === "email");
		const adCopy = performance.find((p) => p.contentType === "ad_copy");
		expect(email).toMatchObject({ avgScore: 80, count: 2 }); // reportA1 (90) + reportB1 (70)
		expect(adCopy).toMatchObject({ avgScore: 40, count: 1 });
	});
});

describe("getBrandComparison", () => {
	it("ranks brands by audit count and reports off-brand totals", async () => {
		const { t, ownerId, workspaceId } = await seedDataset();

		const comparison = await asUser(t, ownerId).query(api.analytics.getBrandComparison, {
			workspaceId,
			fromTs: FROM_TS,
			toTs: TO_TS,
		});

		expect(comparison[0]).toMatchObject({
			brandName: "Brand A",
			auditCount: 2,
			offBrandCount: 1,
		});
		expect(comparison[1]).toMatchObject({ brandName: "Brand B", auditCount: 1 });
	});
});

describe("getRiskyAudits", () => {
	it("surfaces off-brand or low-scoring reports with their finding counts", async () => {
		const { t, ownerId, workspaceId, reportA2 } = await seedDataset();

		const risky = await asUser(t, ownerId).query(api.analytics.getRiskyAudits, {
			workspaceId,
			fromTs: FROM_TS,
			toTs: TO_TS,
		});

		expect(risky).toHaveLength(1);
		expect(risky[0]).toMatchObject({
			reportId: reportA2,
			score: 40,
			verdict: "off_brand",
			findingsCount: 1,
			mainIssueType: "banned_phrase",
		});
	});
});
