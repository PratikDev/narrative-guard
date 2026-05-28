import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthUserId } from "./lib/requireAuth";
import {
	resolveWorkspaceForMutation,
	requireWorkspaceRole,
} from "./lib/workspaceAuth";

export const listWorkspaces = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuthUserId(ctx);

		const memberships = await ctx.db
			.query("workspaceMembers")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		const activeMemberships = memberships.filter(
			(membership) => membership.status === "active",
		);

		const workspaces = await Promise.all(
			activeMemberships.map(async (membership) => {
				const workspace = await ctx.db.get(membership.workspaceId);
				if (!workspace) return null;

				return {
					workspace,
					membership,
				};
			}),
		);

		return workspaces.filter((workspace) => workspace !== null);
	},
});

export const getOrCreateDefaultWorkspace = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuthUserId(ctx);
		const membership = await resolveWorkspaceForMutation(ctx, userId);
		const workspace = await ctx.db.get(membership.workspaceId);

		if (!workspace) {
			throw new Error("Workspace not found.");
		}

		return {
			workspace,
			membership,
		};
	},
});

export const updateWorkspace = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		await requireWorkspaceRole(ctx, args.workspaceId, userId, "owner");

		await ctx.db.patch(args.workspaceId, {
			name: args.name.trim(),
			updatedAt: Date.now(),
		});

		return { workspaceId: args.workspaceId };
	},
});
