import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type WorkspaceRole = Doc<"workspaceMembers">["role"];
type WorkspaceAuthCtx = QueryCtx | MutationCtx;

const ROLE_RANK: Record<WorkspaceRole, number> = {
	member: 1,
	admin: 2,
	owner: 3,
};

export type WorkspaceMembership = Doc<"workspaceMembers">;

export function hasWorkspaceRole(
	role: WorkspaceRole,
	minimumRole: WorkspaceRole,
) {
	return ROLE_RANK[role] >= ROLE_RANK[minimumRole];
}

export async function getActiveWorkspaceMembership(
	ctx: WorkspaceAuthCtx,
	workspaceId: Id<"workspaces">,
	userId: Id<"users">,
) {
	const membership = await ctx.db
		.query("workspaceMembers")
		.withIndex("by_workspace_and_user", (q) =>
			q.eq("workspaceId", workspaceId).eq("userId", userId),
		)
		.unique();

	if (!membership || membership.status !== "active") return null;

	return membership;
}

export async function requireWorkspaceMember(
	ctx: WorkspaceAuthCtx,
	workspaceId: Id<"workspaces">,
	userId: Id<"users">,
) {
	const membership = await getActiveWorkspaceMembership(ctx, workspaceId, userId);

	if (!membership) {
		throw new Error("Workspace access required.");
	}

	return membership;
}

export async function requireWorkspaceRole(
	ctx: WorkspaceAuthCtx,
	workspaceId: Id<"workspaces">,
	userId: Id<"users">,
	minimumRole: WorkspaceRole,
) {
	const membership = await requireWorkspaceMember(ctx, workspaceId, userId);

	if (!hasWorkspaceRole(membership.role, minimumRole)) {
		throw new Error("You do not have permission to perform this action.");
	}

	return membership;
}

export function canManageWorkspaceMember(
	actorRole: WorkspaceRole,
	targetRole: WorkspaceRole,
) {
	if (actorRole === "owner") return targetRole !== "owner";
	if (actorRole === "admin") return targetRole === "member";
	return false;
}

export async function getFirstActiveWorkspaceMembership(
	ctx: WorkspaceAuthCtx,
	userId: Id<"users">,
) {
	const memberships = await ctx.db
		.query("workspaceMembers")
		.withIndex("by_user", (q) => q.eq("userId", userId))
		.collect();

	return memberships.find((membership) => membership.status === "active") ?? null;
}

export async function resolveWorkspaceForQuery(
	ctx: WorkspaceAuthCtx,
	userId: Id<"users">,
	workspaceId?: Id<"workspaces">,
) {
	if (workspaceId) {
		return await requireWorkspaceMember(ctx, workspaceId, userId);
	}

	return await getFirstActiveWorkspaceMembership(ctx, userId);
}

export async function resolveWorkspaceForMutation(
	ctx: MutationCtx,
	userId: Id<"users">,
	workspaceId?: Id<"workspaces">,
) {
	if (workspaceId) {
		return await requireWorkspaceMember(ctx, workspaceId, userId);
	}

	const existingMembership = await getFirstActiveWorkspaceMembership(ctx, userId);
	if (existingMembership) return existingMembership;

	const now = Date.now();
	const defaultWorkspaceId = await ctx.db.insert("workspaces", {
		name: "My Workspace",
		createdByUserId: userId,
		createdAt: now,
		updatedAt: now,
	});

	const membershipId = await ctx.db.insert("workspaceMembers", {
		workspaceId: defaultWorkspaceId,
		userId,
		role: "owner",
		status: "active",
		createdAt: now,
		updatedAt: now,
	});

	const membership = await ctx.db.get(membershipId);
	if (!membership) {
		throw new Error("Could not create workspace membership.");
	}

	return membership;
}
