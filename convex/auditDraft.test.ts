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
} from "./test/seed";

const modules = import.meta.glob("./**/*.ts");

async function setup() {
	const t = convexTest(schema, modules);
	const ownerId = await createUser(t, { name: "Owner", email: "owner@example.com" });
	const workspaceId = await createWorkspaceWithOwner(t, ownerId);
	const brandId = await createReadyBrand(t, workspaceId, ownerId);
	return { t, ownerId, workspaceId, brandId };
}

describe("createDraft", () => {
	it("rejects blank title or content", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();

		await expect(
			asUser(t, ownerId).mutation(api.auditDraft.createDraft, {
				workspaceId,
				brandId,
				contentType: "generic",
				title: "   ",
				content: "hello",
			}),
		).rejects.toThrow(/title is required/i);

		await expect(
			asUser(t, ownerId).mutation(api.auditDraft.createDraft, {
				workspaceId,
				brandId,
				contentType: "generic",
				title: "Draft",
				content: "   ",
			}),
		).rejects.toThrow(/content is required/i);
	});

	it("saves a trimmed draft for a workspace member", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();

		const draftId = await asUser(t, ownerId).mutation(api.auditDraft.createDraft, {
			workspaceId,
			brandId,
			contentType: "email",
			title: "  My draft  ",
			content: "  Body text  ",
		});

		const draft = await t.run((ctx) => ctx.db.get(draftId));
		expect(draft?.title).toBe("My draft");
		expect(draft?.content).toBe("Body text");
		expect(draft?.status).toBe("draft");
	});

	it("rejects a brand from a different workspace", async () => {
		const { t, ownerId, brandId } = await setup();
		const otherWorkspaceId = await createWorkspaceWithOwner(t, ownerId, "Other");

		await expect(
			asUser(t, ownerId).mutation(api.auditDraft.createDraft, {
				workspaceId: otherWorkspaceId,
				brandId,
				contentType: "generic",
				title: "Draft",
				content: "Body",
			}),
		).rejects.toThrow(/not found/i);
	});
});

describe("discardDraft", () => {
	it("only discards drafts that are still active", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		const draftId = await asUser(t, ownerId).mutation(api.auditDraft.createDraft, {
			workspaceId,
			brandId,
			contentType: "generic",
			title: "Draft",
			content: "Body",
		});

		await asUser(t, ownerId).mutation(api.auditDraft.discardDraft, { draftId });
		const draft = await t.run((ctx) => ctx.db.get(draftId));
		expect(draft?.status).toBe("discarded");

		await expect(
			asUser(t, ownerId).mutation(api.auditDraft.discardDraft, { draftId }),
		).rejects.toThrow(/only active drafts/i);
	});
});

describe("runDraftAudit", () => {
	it("requires the brand to be ready", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const indexingBrandId = await createReadyBrand(t, workspaceId, ownerId, {
			ragStatus: "indexing",
		});
		const draftId = await asUser(t, ownerId).mutation(api.auditDraft.createDraft, {
			workspaceId,
			brandId: indexingBrandId,
			contentType: "generic",
			title: "Draft",
			content: "Body",
		});

		await expect(
			asUser(t, ownerId).mutation(api.auditDraft.runDraftAudit, { draftId }),
		).rejects.toThrow(/still indexing/i);
	});

	it("creates a processing report and marks the draft audited", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		const draftId = await asUser(t, ownerId).mutation(api.auditDraft.createDraft, {
			workspaceId,
			brandId,
			contentType: "generic",
			title: "Draft",
			content: "Body",
		});

		const { reportId } = await asUser(t, ownerId).mutation(
			api.auditDraft.runDraftAudit,
			{ draftId },
		);

		const draft = await t.run((ctx) => ctx.db.get(draftId));
		expect(draft?.status).toBe("audited");
		expect(draft?.reportId).toBe(reportId);

		const report = await t.run((ctx) => ctx.db.get(reportId));
		expect(report?.status).toBe("processing");
		expect(report?.originalContent).toBe("Body");
	});

	it("cannot be run twice on the same draft", async () => {
		const { t, ownerId, workspaceId, brandId } = await setup();
		const draftId = await asUser(t, ownerId).mutation(api.auditDraft.createDraft, {
			workspaceId,
			brandId,
			contentType: "generic",
			title: "Draft",
			content: "Body",
		});
		await asUser(t, ownerId).mutation(api.auditDraft.runDraftAudit, { draftId });

		await expect(
			asUser(t, ownerId).mutation(api.auditDraft.runDraftAudit, { draftId }),
		).rejects.toThrow(/only active drafts/i);
	});
});
