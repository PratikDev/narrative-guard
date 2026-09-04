/// <reference types="vite/client" />
// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import schema from "../schema";
import {
	addMember,
	createUser,
	createWorkspaceWithOwner,
} from "../test/seed";
import {
	canManageWorkspaceMember,
	getFirstActiveWorkspaceMembership,
	hasWorkspaceRole,
	requireWorkspaceMember,
	requireWorkspaceRole,
	resolveWorkspaceForMutation,
	resolveWorkspaceForQuery,
} from "./workspaceAuth";

const modules = import.meta.glob("../**/*.ts");

describe("hasWorkspaceRole", () => {
	it("passes when the actor role outranks or equals the minimum", () => {
		expect(hasWorkspaceRole("owner", "owner")).toBe(true);
		expect(hasWorkspaceRole("owner", "admin")).toBe(true);
		expect(hasWorkspaceRole("owner", "member")).toBe(true);
		expect(hasWorkspaceRole("admin", "admin")).toBe(true);
		expect(hasWorkspaceRole("admin", "member")).toBe(true);
		expect(hasWorkspaceRole("member", "member")).toBe(true);
	});

	it("fails when the actor role is below the minimum", () => {
		expect(hasWorkspaceRole("admin", "owner")).toBe(false);
		expect(hasWorkspaceRole("member", "owner")).toBe(false);
		expect(hasWorkspaceRole("member", "admin")).toBe(false);
	});
});

describe("canManageWorkspaceMember", () => {
	it("lets an owner manage anyone except another owner", () => {
		expect(canManageWorkspaceMember("owner", "admin")).toBe(true);
		expect(canManageWorkspaceMember("owner", "member")).toBe(true);
		expect(canManageWorkspaceMember("owner", "owner")).toBe(false);
	});

	it("lets an admin manage only members", () => {
		expect(canManageWorkspaceMember("admin", "member")).toBe(true);
		expect(canManageWorkspaceMember("admin", "admin")).toBe(false);
		expect(canManageWorkspaceMember("admin", "owner")).toBe(false);
	});

	it("never lets a member manage anyone", () => {
		expect(canManageWorkspaceMember("member", "member")).toBe(false);
		expect(canManageWorkspaceMember("member", "admin")).toBe(false);
		expect(canManageWorkspaceMember("member", "owner")).toBe(false);
	});
});

// The remaining helpers touch the database, so they run against a
// convex-test backend rather than as plain unit tests.

describe("requireWorkspaceMember", () => {
	it("returns the membership for an active member", async () => {
		const t = convexTest(schema, modules);
		const ownerId = await createUser(t);
		const workspaceId = await createWorkspaceWithOwner(t, ownerId);

		const membership = await t.run((ctx) =>
			requireWorkspaceMember(ctx, workspaceId, ownerId),
		);
		expect(membership.role).toBe("owner");
	});

	it("throws for a user with no membership", async () => {
		const t = convexTest(schema, modules);
		const ownerId = await createUser(t);
		const workspaceId = await createWorkspaceWithOwner(t, ownerId);
		const strangerId = await createUser(t, { email: "stranger@example.com" });

		await expect(
			t.run((ctx) => requireWorkspaceMember(ctx, workspaceId, strangerId)),
		).rejects.toThrow(/access required/i);
	});

	it("throws for a removed member", async () => {
		const t = convexTest(schema, modules);
		const ownerId = await createUser(t);
		const workspaceId = await createWorkspaceWithOwner(t, ownerId);
		const memberId = await createUser(t, { email: "member@example.com" });
		await addMember(t, workspaceId, memberId, "member", "removed");

		await expect(
			t.run((ctx) => requireWorkspaceMember(ctx, workspaceId, memberId)),
		).rejects.toThrow(/access required/i);
	});
});

describe("requireWorkspaceRole", () => {
	it("passes when the member meets the minimum role", async () => {
		const t = convexTest(schema, modules);
		const ownerId = await createUser(t);
		const workspaceId = await createWorkspaceWithOwner(t, ownerId);

		await expect(
			t.run((ctx) => requireWorkspaceRole(ctx, workspaceId, ownerId, "admin")),
		).resolves.toMatchObject({ role: "owner" });
	});

	it("throws when the member is below the minimum role", async () => {
		const t = convexTest(schema, modules);
		const ownerId = await createUser(t);
		const workspaceId = await createWorkspaceWithOwner(t, ownerId);
		const memberId = await createUser(t, { email: "member@example.com" });
		await addMember(t, workspaceId, memberId, "member");

		await expect(
			t.run((ctx) => requireWorkspaceRole(ctx, workspaceId, memberId, "admin")),
		).rejects.toThrow(/do not have permission/i);
	});
});

describe("getFirstActiveWorkspaceMembership", () => {
	it("skips a removed membership and returns the next active one", async () => {
		const t = convexTest(schema, modules);
		const ownerId = await createUser(t);
		const removedWorkspaceId = await createWorkspaceWithOwner(t, ownerId, "Old");
		const activeWorkspaceId = await createWorkspaceWithOwner(t, ownerId, "New");
		await t.run(async (ctx) => {
			const membership = await ctx.db
				.query("workspaceMembers")
				.withIndex("by_workspace_and_user", (q) =>
					q.eq("workspaceId", removedWorkspaceId).eq("userId", ownerId),
				)
				.unique();
			if (membership) {
				await ctx.db.patch(membership._id, { status: "removed" });
			}
		});

		const membership = await t.run((ctx) =>
			getFirstActiveWorkspaceMembership(ctx, ownerId),
		);
		expect(membership?.workspaceId).toBe(activeWorkspaceId);
	});

	it("returns null when the user has no active membership", async () => {
		const t = convexTest(schema, modules);
		const userId = await createUser(t);

		const membership = await t.run((ctx) =>
			getFirstActiveWorkspaceMembership(ctx, userId),
		);
		expect(membership).toBeNull();
	});
});

describe("resolveWorkspaceForQuery", () => {
	it("returns the requested workspace's membership when the user belongs to it", async () => {
		const t = convexTest(schema, modules);
		const ownerId = await createUser(t);
		const workspaceId = await createWorkspaceWithOwner(t, ownerId);

		const membership = await t.run((ctx) =>
			resolveWorkspaceForQuery(ctx, ownerId, workspaceId),
		);
		expect(membership?.workspaceId).toBe(workspaceId);
	});

	it("throws when an explicit workspaceId is not one the user belongs to", async () => {
		const t = convexTest(schema, modules);
		const ownerId = await createUser(t);
		const workspaceId = await createWorkspaceWithOwner(t, ownerId);
		const strangerId = await createUser(t, { email: "stranger@example.com" });

		await expect(
			t.run((ctx) => resolveWorkspaceForQuery(ctx, strangerId, workspaceId)),
		).rejects.toThrow();
	});

	it("falls back to the user's first active membership when no workspaceId is given", async () => {
		const t = convexTest(schema, modules);
		const ownerId = await createUser(t);
		const workspaceId = await createWorkspaceWithOwner(t, ownerId);

		const membership = await t.run((ctx) =>
			resolveWorkspaceForQuery(ctx, ownerId, undefined),
		);
		expect(membership?.workspaceId).toBe(workspaceId);
	});

	it("returns null for a user with no workspace at all", async () => {
		const t = convexTest(schema, modules);
		const userId = await createUser(t);

		const membership = await t.run((ctx) =>
			resolveWorkspaceForQuery(ctx, userId, undefined),
		);
		expect(membership).toBeNull();
	});
});

describe("resolveWorkspaceForMutation", () => {
	it("creates a default workspace and owner membership for a brand-new user", async () => {
		const t = convexTest(schema, modules);
		const userId = await createUser(t);

		const membership = await t.run((ctx) =>
			resolveWorkspaceForMutation(ctx, userId, undefined),
		);
		expect(membership.role).toBe("owner");
		expect(membership.status).toBe("active");

		const workspace = await t.run((ctx) => ctx.db.get(membership.workspaceId));
		expect(workspace?.createdByUserId).toBe(userId);
	});

	it("is idempotent: a second call reuses the same default workspace", async () => {
		const t = convexTest(schema, modules);
		const userId = await createUser(t);

		const first = await t.run((ctx) =>
			resolveWorkspaceForMutation(ctx, userId, undefined),
		);
		const second = await t.run((ctx) =>
			resolveWorkspaceForMutation(ctx, userId, undefined),
		);
		expect(second.workspaceId).toBe(first.workspaceId);
	});

	it("does not create a workspace when the user already belongs to one", async () => {
		const t = convexTest(schema, modules);
		const ownerId = await createUser(t);
		const workspaceId = await createWorkspaceWithOwner(t, ownerId);

		const membership = await t.run((ctx) =>
			resolveWorkspaceForMutation(ctx, ownerId, undefined),
		);
		expect(membership.workspaceId).toBe(workspaceId);

		const allWorkspaces = await t.run((ctx) => ctx.db.query("workspaces").collect());
		expect(allWorkspaces).toHaveLength(1);
	});
});
