import type { TestConvex } from "convex-test";
import type { Doc, Id } from "../_generated/dataModel";
import type schema from "../schema";

// Shared seed helpers for the convex-test backend suites. Not a test file
// itself (no *.test.ts suffix), so it stays out of vitest's include glob and
// convex-test's import.meta.glob module map, same as convex/lib/*.ts.

export type T = TestConvex<typeof schema>;

export function asUser(t: T, userId: Id<"users">) {
	return t.withIdentity({ subject: userId });
}

export async function createUser(
	t: T,
	attrs: Partial<Pick<Doc<"users">, "name" | "email">> = {},
) {
	return await t.run(async (ctx) =>
		ctx.db.insert("users", {
			name: "Test User",
			email: "user@example.com",
			...attrs,
		}),
	);
}

export async function createWorkspaceWithOwner(
	t: T,
	ownerId: Id<"users">,
	name = "Acme",
) {
	return await t.run(async (ctx) => {
		const now = Date.now();
		const workspaceId = await ctx.db.insert("workspaces", {
			name,
			createdByUserId: ownerId,
			createdAt: now,
			updatedAt: now,
		});
		await ctx.db.insert("workspaceMembers", {
			workspaceId,
			userId: ownerId,
			role: "owner",
			status: "active",
			createdAt: now,
			updatedAt: now,
		});
		return workspaceId;
	});
}

export async function addMember(
	t: T,
	workspaceId: Id<"workspaces">,
	userId: Id<"users">,
	role: Doc<"workspaceMembers">["role"] = "member",
	status: Doc<"workspaceMembers">["status"] = "active",
) {
	return await t.run(async (ctx) => {
		const now = Date.now();
		return await ctx.db.insert("workspaceMembers", {
			workspaceId,
			userId,
			role,
			status,
			createdAt: now,
			updatedAt: now,
		});
	});
}

export async function createReadyBrand(
	t: T,
	workspaceId: Id<"workspaces">,
	ownerId: Id<"users">,
	attrs: Partial<Doc<"brands">> = {},
) {
	return await t.run(async (ctx) => {
		const now = Date.now();
		return await ctx.db.insert("brands", {
			userId: ownerId,
			workspaceId,
			name: "Test Brand",
			constitution: "Be nice. Never say 'cheap'.",
			ragStatus: "ready",
			createdAt: now,
			updatedAt: now,
			...attrs,
		});
	});
}

const REPORT_DEFAULTS = {
	contentType: "generic" as const,
	originalContent: "Some content.",
	score: 80,
	verdict: "on_brand" as const,
	summary: "Looks fine.",
	toneAlignment: 80,
	messagingAlignment: 80,
	bannedPhraseSafety: 80,
	audienceFit: 80,
	clarityAndTrust: 80,
	rewriteSuggestion: "",
	status: "complete" as const,
};

export async function insertReport(
	t: T,
	args: {
		userId: Id<"users">;
		workspaceId: Id<"workspaces">;
		brandId: Id<"brands">;
	} & Partial<Omit<Doc<"auditReports">, "_id" | "_creationTime">>,
) {
	return await t.run(async (ctx) => {
		const now = Date.now();
		return await ctx.db.insert("auditReports", {
			createdAt: now,
			updatedAt: now,
			...REPORT_DEFAULTS,
			...args,
		});
	});
}

export async function insertFinding(
	t: T,
	args: {
		userId: Id<"users">;
		workspaceId: Id<"workspaces">;
		reportId: Id<"auditReports">;
		brandId: Id<"brands">;
	} & Partial<Omit<Doc<"auditFindings">, "_id" | "_creationTime">>,
) {
	return await t.run(async (ctx) => {
		const now = Date.now();
		return await ctx.db.insert("auditFindings", {
			sentence: "This is cheap.",
			reason: "Uses a banned phrase.",
			evidence: "cheap",
			severity: "medium",
			issueType: "banned_phrase",
			createdAt: now,
			...args,
		});
	});
}
