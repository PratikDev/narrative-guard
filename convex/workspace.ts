import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthUserId } from "./lib/requireAuth";
import {
	canManageWorkspaceMember,
	resolveWorkspaceForMutation,
	requireWorkspaceMember,
	requireWorkspaceRole,
} from "./lib/workspaceAuth";

const inviteRole = v.union(v.literal("admin"), v.literal("member"));
const INVITE_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7;

function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

function createInviteToken() {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
		"",
	);
}

async function hashInviteToken(token: string) {
	const bytes = new TextEncoder().encode(token);
	const digest = await crypto.subtle.digest("SHA-256", bytes);
	return Array.from(new Uint8Array(digest), (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");
}

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

export const listMembers = query({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		await requireWorkspaceMember(ctx, args.workspaceId, userId);

		const members = await ctx.db
			.query("workspaceMembers")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.collect();

		const activeMembers = members.filter((member) => member.status === "active");

		return await Promise.all(
			activeMembers.map(async (member) => {
				const user = await ctx.db.get(member.userId);

				return {
					member,
					user: user
						? {
								id: user._id,
								name: user.name,
								email: user.email,
								image: user.image,
							}
						: null,
				};
			}),
		);
	},
});

export const listInvites = query({
	args: {
		workspaceId: v.id("workspaces"),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		await requireWorkspaceRole(ctx, args.workspaceId, userId, "admin");

		const invites = await ctx.db
			.query("workspaceInvites")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.collect();

		return invites
			.filter((invite) => invite.status === "pending")
			.sort((a, b) => b.createdAt - a.createdAt);
	},
});

export const inviteMember = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		email: v.string(),
		role: inviteRole,
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		const actorMembership = await requireWorkspaceRole(
			ctx,
			args.workspaceId,
			userId,
			"admin",
		);
		if (
			actorMembership.role === "admin" &&
			!canManageWorkspaceMember(actorMembership.role, args.role)
		) {
			throw new Error("Admins can only invite members.");
		}

		const email = normalizeEmail(args.email);
		if (!email) {
			throw new Error("Email is required.");
		}

		const pendingInvites = await ctx.db
			.query("workspaceInvites")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.collect();
		const existingPendingInvite = pendingInvites.find(
			(invite) => invite.email === email && invite.status === "pending",
		);
		if (existingPendingInvite) {
			throw new Error("This email already has a pending invite.");
		}

		const token = createInviteToken();
		const tokenHash = await hashInviteToken(token);
		const now = Date.now();
		const inviteId = await ctx.db.insert("workspaceInvites", {
			workspaceId: args.workspaceId,
			email,
			role: args.role,
			tokenHash,
			status: "pending",
			invitedByUserId: userId,
			expiresAt: now + INVITE_EXPIRY_MS,
			createdAt: now,
			updatedAt: now,
		});

		return {
			inviteId,
			token,
			invitePath: `/invite/${token}`,
		};
	},
});

export const revokeInvite = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		inviteId: v.id("workspaceInvites"),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		await requireWorkspaceRole(ctx, args.workspaceId, userId, "admin");

		const invite = await ctx.db.get(args.inviteId);
		if (!invite || invite.workspaceId !== args.workspaceId) {
			throw new Error("Invite not found.");
		}

		await ctx.db.patch(args.inviteId, {
			status: "revoked",
			updatedAt: Date.now(),
		});

		return { inviteId: args.inviteId };
	},
});

export const acceptInvite = mutation({
	args: {
		token: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		const user = await ctx.db.get(userId);
		const tokenHash = await hashInviteToken(args.token);
		const invite = await ctx.db
			.query("workspaceInvites")
			.withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
			.unique();

		if (!invite || invite.status !== "pending") {
			throw new Error("Invite is no longer valid.");
		}
		if (invite.expiresAt < Date.now()) {
			await ctx.db.patch(invite._id, {
				status: "expired",
				updatedAt: Date.now(),
			});
			throw new Error("Invite has expired.");
		}
		if (user?.email && normalizeEmail(user.email) !== invite.email) {
			throw new Error("This invite was sent to a different email address.");
		}

		const existingMembership = await ctx.db
			.query("workspaceMembers")
			.withIndex("by_workspace_and_user", (q) =>
				q.eq("workspaceId", invite.workspaceId).eq("userId", userId),
			)
			.unique();
		const now = Date.now();

		if (existingMembership) {
			await ctx.db.patch(existingMembership._id, {
				role: invite.role,
				status: "active",
				updatedAt: now,
			});
		} else {
			await ctx.db.insert("workspaceMembers", {
				workspaceId: invite.workspaceId,
				userId,
				role: invite.role,
				status: "active",
				createdAt: now,
				updatedAt: now,
			});
		}

		await ctx.db.patch(invite._id, {
			status: "accepted",
			updatedAt: now,
		});

		return {
			workspaceId: invite.workspaceId,
		};
	},
});

export const updateMemberRole = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		memberId: v.id("workspaceMembers"),
		role: inviteRole,
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		await requireWorkspaceRole(ctx, args.workspaceId, userId, "owner");

		const member = await ctx.db.get(args.memberId);
		if (!member || member.workspaceId !== args.workspaceId) {
			throw new Error("Member not found.");
		}
		if (member.role === "owner") {
			throw new Error("Owners cannot be changed from this screen.");
		}

		await ctx.db.patch(args.memberId, {
			role: args.role,
			updatedAt: Date.now(),
		});

		return { memberId: args.memberId };
	},
});

export const removeMember = mutation({
	args: {
		workspaceId: v.id("workspaces"),
		memberId: v.id("workspaceMembers"),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		const actorMembership = await requireWorkspaceRole(
			ctx,
			args.workspaceId,
			userId,
			"admin",
		);
		const targetMembership = await ctx.db.get(args.memberId);

		if (!targetMembership || targetMembership.workspaceId !== args.workspaceId) {
			throw new Error("Member not found.");
		}
		if (
			!canManageWorkspaceMember(actorMembership.role, targetMembership.role)
		) {
			throw new Error("You do not have permission to remove this member.");
		}
		if (targetMembership.userId === userId) {
			throw new Error("You cannot remove yourself.");
		}

		await ctx.db.patch(args.memberId, {
			status: "removed",
			updatedAt: Date.now(),
		});

		return { memberId: args.memberId };
	},
});
