/// <reference types="vite/client" />
// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import schema from "./schema";
import {
	asUser,
	createReadyBrand,
	createUser,
	createWorkspaceWithOwner,
	insertReport,
} from "./test/seed";

const modules = import.meta.glob("./**/*.ts");

async function setup() {
	const t = convexTest(schema, modules);
	const ownerId = await createUser(t, {
		name: "Owner",
		email: "owner@example.com",
	});
	const workspaceId = await createWorkspaceWithOwner(t, ownerId);
	const brandId = await createReadyBrand(t, workspaceId, ownerId);
	return { t, ownerId, workspaceId, brandId };
}

describe("createManualAudit", () => {
	it("requires authentication", async () => {
		const { t, brandId } = await setup();
		await expect(
			t.mutation(api.audit.createManualAudit, {
				brandId,
				contentType: "generic",
				content: "hello",
			}),
		).rejects.toThrow();
	});

	it("creates a trimmed, processing report for a workspace member", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();

		const { reportId } = await asUser(t, ownerId).mutation(
			api.audit.createManualAudit,
			{
				workspaceId,
				brandId,
				contentType: "generic",
				content: "  hello world  ",
			},
		);

		const report = await t.run((ctx) => ctx.db.get(reportId));
		expect(report?.status).toBe("processing");
		expect(report?.originalContent).toBe("hello world");
		expect(report?.workspaceId).toBe(workspaceId);
		expect(report?.brandId).toBe(brandId);
	});

	it("rejects a brand that is still indexing", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const indexingBrandId = await createReadyBrand(t, workspaceId, ownerId, {
			ragStatus: "indexing",
		});

		await expect(
			asUser(t, ownerId).mutation(api.audit.createManualAudit, {
				workspaceId,
				brandId: indexingBrandId,
				contentType: "generic",
				content: "hello",
			}),
		).rejects.toThrow(/still indexing/);
	});

	it("rejects a brand from a different workspace", async () => {
		const { t, ownerId, brandId } = await setup();
		const otherWorkspaceId = await createWorkspaceWithOwner(t, ownerId, "Other");

		await expect(
			asUser(t, ownerId).mutation(api.audit.createManualAudit, {
				workspaceId: otherWorkspaceId,
				brandId,
				contentType: "generic",
				content: "hello",
			}),
		).rejects.toThrow(/not found/i);
	});

	it("rejects a user who is not a member of the brand's workspace", async () => {
		const { t, brandId, workspaceId } = await setup();
		const outsiderId = await createUser(t, {
			name: "Outsider",
			email: "outsider@example.com",
		});

		await expect(
			asUser(t, outsiderId).mutation(api.audit.createManualAudit, {
				workspaceId,
				brandId,
				contentType: "generic",
				content: "hello",
			}),
		).rejects.toThrow();
	});
});

describe("retryFailedAudit", () => {
	it("only retries reports in the 'failed' status", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		const processingReportId = await insertReport(t, {
			userId: ownerId,
			workspaceId,
			brandId,
			status: "processing",
		});

		await expect(
			asUser(t, ownerId).mutation(api.audit.retryFailedAudit, {
				workspaceId,
				reportId: processingReportId,
			}),
		).rejects.toThrow(/only failed audits/i);
	});

	it("creates a new processing report linked back to the original", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		const failedReportId = await insertReport(t, {
			userId: ownerId,
			workspaceId,
			brandId,
			status: "failed",
			originalContent: "original text",
			error: "boom",
		});

		const { reportId: retryReportId } = await asUser(t, ownerId).mutation(
			api.audit.retryFailedAudit,
			{ workspaceId, reportId: failedReportId },
		);

		expect(retryReportId).not.toBe(failedReportId);
		const retryReport = await t.run((ctx) => ctx.db.get(retryReportId));
		expect(retryReport?.status).toBe("processing");
		expect(retryReport?.originalContent).toBe("original text");
		expect(retryReport?.retryOfReportId).toBe(failedReportId);
	});
});

describe("completeAudit (internal)", () => {
	it("clamps out-of-range scores, stores findings, and notifies the auditor", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		const reportId = await insertReport(t, {
			userId: ownerId,
			workspaceId,
			brandId,
			status: "processing",
		});

		await t.mutation(internal.audit.completeAudit, {
			reportId,
			score: 150,
			verdict: "on_brand",
			summary: "Great work.",
			toneAlignment: -10,
			messagingAlignment: 50,
			bannedPhraseSafety: 50,
			audienceFit: 50,
			clarityAndTrust: 50,
			rewriteSuggestion: "Do this instead.",
			findings: [
				{
					sentence: "a",
					reason: "b",
					evidence: "c",
					severity: "low",
					issueType: "mild_style",
				},
				{
					sentence: "d",
					reason: "e",
					evidence: "f",
					severity: "high",
					issueType: "banned_phrase",
				},
			],
		});

		const report = await t.run((ctx) => ctx.db.get(reportId));
		expect(report?.status).toBe("complete");
		expect(report?.score).toBe(100);
		expect(report?.toneAlignment).toBe(0);
		expect(report?.error).toBeUndefined();

		const findings = await t.run((ctx) =>
			ctx.db
				.query("auditFindings")
				.withIndex("by_report", (q) => q.eq("reportId", reportId))
				.collect(),
		);
		expect(findings).toHaveLength(2);

		const notifications = await t.run((ctx) =>
			ctx.db
				.query("notifications")
				.withIndex("by_user_and_created_at", (q) => q.eq("userId", ownerId))
				.collect(),
		);
		expect(
			notifications.some(
				(n) => n.type === "audit_completed" && n.reportId === reportId,
			),
		).toBe(true);
	});
});

describe("failAudit (internal)", () => {
	it("marks the report failed and notifies the auditor", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		const reportId = await insertReport(t, {
			userId: ownerId,
			workspaceId,
			brandId,
			status: "processing",
		});

		await t.mutation(internal.audit.failAudit, {
			reportId,
			error: "The model timed out.",
		});

		const report = await t.run((ctx) => ctx.db.get(reportId));
		expect(report?.status).toBe("failed");
		expect(report?.error).toBe("The model timed out.");

		const notifications = await t.run((ctx) =>
			ctx.db
				.query("notifications")
				.withIndex("by_user_and_created_at", (q) => q.eq("userId", ownerId))
				.collect(),
		);
		expect(notifications.some((n) => n.type === "audit_failed")).toBe(true);
	});
});
