/// <reference types="vite/client" />
// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import schema from "./schema";
import {
	addMember,
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
	return { t, ownerId, workspaceId };
}

describe("createBrand", () => {
	it("lets an owner create a brand and records the first constitution version", async () => {
		const { t, ownerId, workspaceId } = await setup();

		const { brandId } = await asUser(t, ownerId).mutation(api.brand.createBrand, {
			workspaceId,
			name: "Acme Co",
			constitution: "Be warm and confident.",
		});

		const brand = await t.run((ctx) => ctx.db.get(brandId));
		expect(brand?.name).toBe("Acme Co");
		expect(brand?.ragStatus).toBe("indexing");

		const versions = await t.run((ctx) =>
			ctx.db
				.query("brandConstitutionVersions")
				.withIndex("by_brand_and_version", (q) => q.eq("brandId", brandId))
				.collect(),
		);
		expect(versions).toHaveLength(1);
		expect(versions[0]?.version).toBe(1);
	});

	it("does not let a member create a brand", async () => {
		const { t, workspaceId } = await setup();
		const memberId = await createUser(t, { email: "member@example.com" });
		await addMember(t, workspaceId, memberId, "member");

		await expect(
			asUser(t, memberId).mutation(api.brand.createBrand, {
				workspaceId,
				name: "Acme Co",
				constitution: "Be warm.",
			}),
		).rejects.toThrow(/permission/i);
	});
});

describe("updateBrand", () => {
	it("bumps the constitution version only when the text actually changes", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const brandId = await createReadyBrand(t, workspaceId, ownerId, {
			constitution: "Original text.",
		});
		await t.run(async (ctx) => {
			await ctx.db.insert("brandConstitutionVersions", {
				workspaceId,
				brandId,
				userId: ownerId,
				version: 1,
				constitution: "Original text.",
				createdAt: Date.now(),
			});
		});

		// Same text: no new version, but ragStatus still resets to indexing.
		await asUser(t, ownerId).mutation(api.brand.updateBrand, {
			workspaceId,
			brandId,
			name: "Test Brand",
			constitution: "Original text.",
		});
		let versions = await t.run((ctx) =>
			ctx.db
				.query("brandConstitutionVersions")
				.withIndex("by_brand_and_version", (q) => q.eq("brandId", brandId))
				.collect(),
		);
		expect(versions).toHaveLength(1);
		let brand = await t.run((ctx) => ctx.db.get(brandId));
		expect(brand?.ragStatus).toBe("indexing");

		// Different text: a new version is recorded.
		await asUser(t, ownerId).mutation(api.brand.updateBrand, {
			workspaceId,
			brandId,
			name: "Test Brand",
			constitution: "Updated text.",
		});
		versions = await t.run((ctx) =>
			ctx.db
				.query("brandConstitutionVersions")
				.withIndex("by_brand_and_version", (q) => q.eq("brandId", brandId))
				.collect(),
		);
		expect(versions).toHaveLength(2);
		brand = await t.run((ctx) => ctx.db.get(brandId));
		expect(brand?.constitution).toBe("Updated text.");
	});

	it("requires at least an admin role", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const brandId = await createReadyBrand(t, workspaceId, ownerId);
		const memberId = await createUser(t, { email: "member@example.com" });
		await addMember(t, workspaceId, memberId, "member");

		await expect(
			asUser(t, memberId).mutation(api.brand.updateBrand, {
				workspaceId,
				brandId,
				name: "Test Brand",
				constitution: "New text.",
			}),
		).rejects.toThrow();
	});
});

describe("getBrand", () => {
	it("returns null for a brand outside the given workspace", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const brandId = await createReadyBrand(t, workspaceId, ownerId);
		const otherWorkspaceId = await createWorkspaceWithOwner(t, ownerId, "Other");

		const result = await asUser(t, ownerId).query(api.brand.getBrand, {
			workspaceId: otherWorkspaceId,
			brandId,
		});
		expect(result).toBeNull();
	});

	it("throws for a user outside the brand's workspace", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const brandId = await createReadyBrand(t, workspaceId, ownerId);
		const outsiderId = await createUser(t, { email: "outsider@example.com" });

		await expect(
			asUser(t, outsiderId).query(api.brand.getBrand, { brandId }),
		).rejects.toThrow();
	});
});

describe("listBrands", () => {
	it("lists only brands in the caller's workspace, newest first", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const firstId = await createReadyBrand(t, workspaceId, ownerId, {
			name: "First",
			createdAt: 1_000,
			updatedAt: 1_000,
		});
		const secondId = await createReadyBrand(t, workspaceId, ownerId, {
			name: "Second",
			createdAt: 2_000,
			updatedAt: 2_000,
		});
		const otherWorkspaceId = await createWorkspaceWithOwner(t, ownerId, "Other");
		await createReadyBrand(t, otherWorkspaceId, ownerId, { name: "Not mine" });

		const brands = await asUser(t, ownerId).query(api.brand.listBrands, {
			workspaceId,
		});
		expect(brands.map((b) => b._id)).toEqual([secondId, firstId]);
	});
});

describe("markBrandRagReady / markBrandRagFailed (internal)", () => {
	it("marks a brand ready with its RAG entry id", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const brandId = await createReadyBrand(t, workspaceId, ownerId, {
			ragStatus: "indexing",
		});

		await t.mutation(internal.brand.markBrandRagReady, {
			brandId,
			ragEntryId: "entry_123",
		});

		const brand = await t.run((ctx) => ctx.db.get(brandId));
		expect(brand?.ragStatus).toBe("ready");
		expect(brand?.ragEntryId).toBe("entry_123");
		expect(brand?.ragError).toBeUndefined();
	});

	it("marks a brand failed with the error message", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const brandId = await createReadyBrand(t, workspaceId, ownerId, {
			ragStatus: "indexing",
		});

		await t.mutation(internal.brand.markBrandRagFailed, {
			brandId,
			error: "Embedding request failed.",
		});

		const brand = await t.run((ctx) => ctx.db.get(brandId));
		expect(brand?.ragStatus).toBe("failed");
		expect(brand?.ragError).toBe("Embedding request failed.");
	});
});
