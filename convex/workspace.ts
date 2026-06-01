import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
	createNotification,
	notifyWorkspaceMembers,
} from "./lib/notificationHelpers";
import { requireAuthUserId } from "./lib/requireAuth";
import {
	canManageWorkspaceMember,
	requireWorkspaceMember,
	requireWorkspaceRole,
	resolveWorkspaceForMutation,
} from "./lib/workspaceAuth";

const inviteRole = v.union(v.literal("admin"), v.literal("member"));
const INVITE_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7;
const MAX_WORKSPACE_NAME_LENGTH = 80;

function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

function normalizeWorkspaceName(name: string) {
	const normalizedName = name.trim();

	if (!normalizedName) {
		throw new Error("Workspace name is required.");
	}

	if (normalizedName.length > MAX_WORKSPACE_NAME_LENGTH) {
		throw new Error(
			`Workspace name must be ${MAX_WORKSPACE_NAME_LENGTH} characters or fewer.`,
		);
	}

	return normalizedName;
}

function displayUserName(user: Doc<"users"> | null) {
	return user?.name || user?.email || "Someone";
}

async function createWorkspaceInviteNotification(
	ctx: MutationCtx,
	args: {
		invite: Doc<"workspaceInvites">;
		userId: Id<"users">;
		now: number;
	},
) {
	const existingNotification = await ctx.db
		.query("notifications")
		.withIndex("by_user_and_invite", (q) =>
			q.eq("userId", args.userId).eq("inviteId", args.invite._id),
		)
		.unique();

	if (existingNotification) return false;

	const [workspace, inviter] = await Promise.all([
		ctx.db.get(args.invite.workspaceId),
		ctx.db.get(args.invite.invitedByUserId),
	]);

	await createNotification(ctx, {
		userId: args.userId,
		actorUserId: args.invite.invitedByUserId,
		workspaceId: args.invite.workspaceId,
		inviteId: args.invite._id,
		scope: "user",
		type: "workspace_invitation_received",
		title: "Workspace invitation",
		message: `${displayUserName(inviter)} invited you to ${workspace?.name ?? "a workspace"}.`,
		createdAt: args.now,
	});

	return true;
}

async function expireInviteIfNeeded(
	ctx: MutationCtx,
	invite: Doc<"workspaceInvites">,
	now: number,
) {
	if (invite.status !== "pending" || invite.expiresAt >= now) return false;

	await ctx.db.patch(invite._id, {
		status: "expired",
		updatedAt: now,
	});

	return true;
}

function requireInviteRecipient(user: Doc<"users"> | null, inviteEmail: string) {
	if (!user?.email || normalizeEmail(user.email) !== inviteEmail) {
		throw new Error("This invite was sent to a different email address.");
	}
}

async function markInviteNotificationRead(
	ctx: MutationCtx,
	args: {
		userId: Id<"users">;
		inviteId: Id<"workspaceInvites">;
		now: number;
	},
) {
	const notification = await ctx.db
		.query("notifications")
		.withIndex("by_user_and_invite", (q) =>
			q.eq("userId", args.userId).eq("inviteId", args.inviteId),
		)
		.unique();

	if (notification && !notification.readAt) {
		await ctx.db.patch(notification._id, { readAt: args.now });
	}
}

async function acceptWorkspaceInvite(
	ctx: MutationCtx,
	args: {
		invite: Doc<"workspaceInvites">;
		userId: Id<"users">;
		user: Doc<"users"> | null;
		now: number;
	},
) {
	requireInviteRecipient(args.user, args.invite.email);

	const existingMembership = await ctx.db
		.query("workspaceMembers")
		.withIndex("by_workspace_and_user", (q) =>
			q.eq("workspaceId", args.invite.workspaceId).eq("userId", args.userId),
		)
		.unique();

	if (existingMembership) {
		if (existingMembership.status === "active") {
			throw new Error("You are already a member of this workspace.");
		}

		await ctx.db.patch(existingMembership._id, {
			role: args.invite.role,
			status: "active",
			updatedAt: args.now,
		});
	} else {
		await ctx.db.insert("workspaceMembers", {
			workspaceId: args.invite.workspaceId,
			userId: args.userId,
			role: args.invite.role,
			status: "active",
			createdAt: args.now,
			updatedAt: args.now,
		});
	}

	await ctx.db.patch(args.invite._id, {
		status: "accepted",
		updatedAt: args.now,
	});

	await markInviteNotificationRead(ctx, {
		userId: args.userId,
		inviteId: args.invite._id,
		now: args.now,
	});

	const workspace = await ctx.db.get(args.invite.workspaceId);

	await notifyWorkspaceMembers(ctx, {
		workspaceId: args.invite.workspaceId,
		actorUserId: args.userId,
		excludeUserIds: [args.userId],
		type: "workspace_invitation_accepted",
		title: "New member joined",
		message: `${displayUserName(args.user)} accepted the invitation to ${workspace?.name ?? "the workspace"}.`,
		createdAt: args.now,
	});

	return { workspaceId: args.invite.workspaceId };
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

export const createWorkspace = mutation({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		const now = Date.now();
		const workspaceId = await ctx.db.insert("workspaces", {
			name: normalizeWorkspaceName(args.name),
			createdByUserId: userId,
			createdAt: now,
			updatedAt: now,
		});
		const membershipId = await ctx.db.insert("workspaceMembers", {
			workspaceId,
			userId,
			role: "owner",
			status: "active",
			createdAt: now,
			updatedAt: now,
		});

		return {
			workspaceId,
			membershipId,
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
			name: normalizeWorkspaceName(args.name),
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
		const now = Date.now();

		const invites = await ctx.db
			.query("workspaceInvites")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.collect();

		return invites
			.filter((invite) => invite.status === "pending" && invite.expiresAt >= now)
			.sort((a, b) => b.createdAt - a.createdAt);
	},
});

export const syncPendingInviteNotifications = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuthUserId(ctx);
		const user = await ctx.db.get(userId);
		const email = user?.email ? normalizeEmail(user.email) : "";

		if (!email) {
			return { created: 0 };
		}

		const now = Date.now();
		const invites = await ctx.db
			.query("workspaceInvites")
			.withIndex("by_email", (q) => q.eq("email", email))
			.collect();
		let created = 0;

		for (const invite of invites) {
			if (await expireInviteIfNeeded(ctx, invite, now)) continue;
			if (invite.status !== "pending" || invite.expiresAt < now) continue;

			const didCreate = await createWorkspaceInviteNotification(ctx, {
				invite,
				userId,
				now,
			});

			if (didCreate) created += 1;
		}

		return { created };
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
		const members = await ctx.db
			.query("workspaceMembers")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.collect();
		for (const member of members) {
			if (member.status !== "active") continue;

			const memberUser = await ctx.db.get(member.userId);
			if (memberUser?.email && normalizeEmail(memberUser.email) === email) {
				throw new Error("This email is already an active workspace member.");
			}
		}

		const now = Date.now();
		const pendingInvites = await ctx.db
			.query("workspaceInvites")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.collect();
		for (const invite of pendingInvites) {
			await expireInviteIfNeeded(ctx, invite, now);
		}
		const existingPendingInvite = pendingInvites.find((invite) => {
			return (
				invite.email === email &&
				invite.status === "pending" &&
				invite.expiresAt >= now
			);
		});
		if (existingPendingInvite) {
			throw new Error("This email already has a pending invite.");
		}

		const token = createInviteToken();
		const tokenHash = await hashInviteToken(token);
		const workspace = await ctx.db.get(args.workspaceId);
		const actor = await ctx.db.get(userId);
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
		const invite = await ctx.db.get(inviteId);
		const invitedUsers = await ctx.db
			.query("users")
			.withIndex("email", (q) => q.eq("email", email))
			.take(1);
		const invitedUser = invitedUsers[0];

		console.log(`>>>>>>>>>> User ${displayUserName(actor)} invited ${email} to workspace ${workspace?.name ?? args.workspaceId} with role ${args.role}.`);

		if (invite && invitedUser) {
			await createWorkspaceInviteNotification(ctx, {
				invite,
				userId: invitedUser._id,
				now,
			});
		}

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
		const now = Date.now();
		if (await expireInviteIfNeeded(ctx, invite, now)) {
			throw new Error("Invite has expired.");
		}

		return await acceptWorkspaceInvite(ctx, {
			invite,
			userId,
			user,
			now,
		});
	},
});

export const acceptInviteById = mutation({
	args: {
		inviteId: v.id("workspaceInvites"),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		const user = await ctx.db.get(userId);
		const invite = await ctx.db.get(args.inviteId);

		if (!invite || invite.status !== "pending") {
			throw new Error("Invite is no longer valid.");
		}
		const now = Date.now();
		if (await expireInviteIfNeeded(ctx, invite, now)) {
			throw new Error("Invite has expired.");
		}

		return await acceptWorkspaceInvite(ctx, {
			invite,
			userId,
			user,
			now,
		});
	},
});

export const declineInviteById = mutation({
	args: {
		inviteId: v.id("workspaceInvites"),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		const user = await ctx.db.get(userId);
		const invite = await ctx.db.get(args.inviteId);

		if (!invite || invite.status !== "pending") {
			throw new Error("Invite is no longer valid.");
		}
		const now = Date.now();
		if (await expireInviteIfNeeded(ctx, invite, now)) {
			throw new Error("Invite has expired.");
		}

		requireInviteRecipient(user, invite.email);

		await ctx.db.patch(invite._id, {
			status: "declined",
			updatedAt: now,
		});
		await markInviteNotificationRead(ctx, {
			userId,
			inviteId: invite._id,
			now,
		});

		return { inviteId: invite._id };
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
		const now = Date.now();
		const workspace = await ctx.db.get(args.workspaceId);
		const actor = await ctx.db.get(userId);

		await ctx.db.patch(args.memberId, {
			role: args.role,
			updatedAt: now,
		});

		await createNotification(ctx, {
			userId: member.userId,
			actorUserId: userId,
			workspaceId: args.workspaceId,
			scope: "user",
			type: "workspace_role_changed",
			title: "Workspace role changed",
			message: `${displayUserName(actor)} changed your role in ${workspace?.name ?? "the workspace"} to ${args.role}.`,
			createdAt: now,
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
