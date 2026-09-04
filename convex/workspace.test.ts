/// <reference types="vite/client" />
// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";
import { addMember, asUser, createUser, createWorkspaceWithOwner } from "./test/seed";

const modules = import.meta.glob("./**/*.ts");

async function setup() {
	const t = convexTest(schema, modules);
	const ownerId = await createUser(t, { name: "Owner", email: "owner@example.com" });
	const workspaceId = await createWorkspaceWithOwner(t, ownerId);
	return { t, ownerId, workspaceId };
}

describe("createWorkspace / updateWorkspace", () => {
	it("creates a workspace with the caller as owner", async () => {
		const t = convexTest(schema, modules);
		const userId = await createUser(t);

		const { workspaceId, membershipId } = await asUser(t, userId).mutation(
			api.workspace.createWorkspace,
			{ name: "  New Co  " },
		);

		const workspace = await t.run((ctx) => ctx.db.get(workspaceId));
		const membership = await t.run((ctx) => ctx.db.get(membershipId));
		expect(workspace?.name).toBe("New Co");
		expect(membership?.role).toBe("owner");
	});

	it("rejects a blank workspace name", async () => {
		const t = convexTest(schema, modules);
		const userId = await createUser(t);

		await expect(
			asUser(t, userId).mutation(api.workspace.createWorkspace, { name: "   " }),
		).rejects.toThrow(/name is required/i);
	});

	it("lets only the owner rename the workspace", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const adminId = await createUser(t, { email: "admin@example.com" });
		await addMember(t, workspaceId, adminId, "admin");

		await expect(
			asUser(t, adminId).mutation(api.workspace.updateWorkspace, {
				workspaceId,
				name: "New Name",
			}),
		).rejects.toThrow(/permission/i);

		await asUser(t, ownerId).mutation(api.workspace.updateWorkspace, {
			workspaceId,
			name: "New Name",
		});
		const workspace = await t.run((ctx) => ctx.db.get(workspaceId));
		expect(workspace?.name).toBe("New Name");
	});
});

describe("listWorkspaces", () => {
	it("returns only the caller's active memberships", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const otherOwnerId = await createUser(t, { email: "other@example.com" });
		await createWorkspaceWithOwner(t, otherOwnerId, "Not mine");

		const workspaces = await asUser(t, ownerId).query(api.workspace.listWorkspaces, {});
		expect(workspaces).toHaveLength(1);
		expect(workspaces[0]?.workspace._id).toBe(workspaceId);
	});
});

describe("getOrCreateDefaultWorkspace", () => {
	it("gives a brand-new user a default workspace they own", async () => {
		const t = convexTest(schema, modules);
		const userId = await createUser(t);

		const { workspace, membership } = await asUser(t, userId).mutation(
			api.workspace.getOrCreateDefaultWorkspace,
			{},
		);
		expect(membership.role).toBe("owner");
		expect(workspace.createdByUserId).toBe(userId);
	});
});

describe("inviteMember", () => {
	async function inviteSetup() {
		const { t, ownerId, workspaceId } = await setup();
		const adminId = await createUser(t, { email: "admin@example.com" });
		await addMember(t, workspaceId, adminId, "admin");
		return { t, ownerId, workspaceId, adminId };
	}

	it("lets an admin invite a member but not another admin", async () => {
		const { t, workspaceId, adminId } = await inviteSetup();

		await expect(
			asUser(t, adminId).mutation(api.workspace.inviteMember, {
				workspaceId,
				email: "new-admin@example.com",
				role: "admin",
			}),
		).rejects.toThrow(/only invite members/i);

		const result = await asUser(t, adminId).mutation(api.workspace.inviteMember, {
			workspaceId,
			email: "new-member@example.com",
			role: "member",
		});
		expect(result.invitePath).toBe(`/invite/${result.token}`);
	});

	it("hashes the invite token and sets a 7-day expiry", async () => {
		const { t, ownerId, workspaceId } = await inviteSetup();

		const { inviteId, token } = await asUser(t, ownerId).mutation(
			api.workspace.inviteMember,
			{ workspaceId, email: "invitee@example.com", role: "member" },
		);

		const invite = await t.run((ctx) => ctx.db.get(inviteId));
		expect(invite?.tokenHash).toBeTruthy();
		expect(invite?.tokenHash).not.toBe(token);
		expect(invite?.status).toBe("pending");
		expect(invite?.expiresAt).toBeGreaterThan(Date.now());
		expect(invite?.expiresAt).toBeLessThanOrEqual(
			Date.now() + 7 * 24 * 60 * 60 * 1000 + 1000,
		);
	});

	it("rejects a duplicate pending invite for the same email", async () => {
		const { t, ownerId, workspaceId } = await inviteSetup();
		await asUser(t, ownerId).mutation(api.workspace.inviteMember, {
			workspaceId,
			email: "invitee@example.com",
			role: "member",
		});

		await expect(
			asUser(t, ownerId).mutation(api.workspace.inviteMember, {
				workspaceId,
				email: "invitee@example.com",
				role: "member",
			}),
		).rejects.toThrow(/already has a pending invite/i);
	});

	it("rejects inviting an email that is already an active member", async () => {
		const { t, ownerId, workspaceId } = await inviteSetup();
		const memberId = await createUser(t, { email: "member@example.com" });
		await addMember(t, workspaceId, memberId, "member");

		await expect(
			asUser(t, ownerId).mutation(api.workspace.inviteMember, {
				workspaceId,
				email: "member@example.com",
				role: "member",
			}),
		).rejects.toThrow(/already an active workspace member/i);
	});
});

describe("acceptInvite (by token)", () => {
	it("adds the recipient as an active member and consumes the invite", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const inviteeId = await createUser(t, { email: "invitee@example.com" });
		const { token } = await asUser(t, ownerId).mutation(api.workspace.inviteMember, {
			workspaceId,
			email: "invitee@example.com",
			role: "member",
		});

		const result = await asUser(t, inviteeId).mutation(api.workspace.acceptInvite, {
			token,
		});
		expect(result.workspaceId).toBe(workspaceId);

		const membership = await t.run((ctx) =>
			ctx.db
				.query("workspaceMembers")
				.withIndex("by_workspace_and_user", (q) =>
					q.eq("workspaceId", workspaceId).eq("userId", inviteeId),
				)
				.unique(),
		);
		expect(membership?.status).toBe("active");
		expect(membership?.role).toBe("member");
	});

	it("rejects a token whose invite was sent to a different email", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const wrongUserId = await createUser(t, { email: "someone-else@example.com" });
		const { token } = await asUser(t, ownerId).mutation(api.workspace.inviteMember, {
			workspaceId,
			email: "invitee@example.com",
			role: "member",
		});

		await expect(
			asUser(t, wrongUserId).mutation(api.workspace.acceptInvite, { token }),
		).rejects.toThrow(/different email/i);
	});

	it("rejects an expired invite", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const inviteeId = await createUser(t, { email: "invitee@example.com" });
		const { token, inviteId } = await asUser(t, ownerId).mutation(
			api.workspace.inviteMember,
			{ workspaceId, email: "invitee@example.com", role: "member" },
		);
		await t.run((ctx) => ctx.db.patch(inviteId, { expiresAt: Date.now() - 1000 }));

		await expect(
			asUser(t, inviteeId).mutation(api.workspace.acceptInvite, { token }),
		).rejects.toThrow(/expired/i);

		// The mutation throws after flagging the invite expired, so Convex rolls
		// the whole transaction back (including that patch) and no membership
		// is created — the invite is left exactly as it was.
		const invite = await t.run((ctx) => ctx.db.get(inviteId));
		expect(invite?.status).toBe("pending");
		const membership = await t.run((ctx) =>
			ctx.db
				.query("workspaceMembers")
				.withIndex("by_workspace_and_user", (q) =>
					q.eq("workspaceId", workspaceId).eq("userId", inviteeId),
				)
				.unique(),
		);
		expect(membership).toBeNull();
	});

	it("reactivates a previously removed membership", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const memberId = await createUser(t, { email: "returning@example.com" });
		await addMember(t, workspaceId, memberId, "member", "removed");

		const { token } = await asUser(t, ownerId).mutation(api.workspace.inviteMember, {
			workspaceId,
			email: "returning@example.com",
			role: "admin",
		});
		await asUser(t, memberId).mutation(api.workspace.acceptInvite, { token });

		const membership = await t.run((ctx) =>
			ctx.db
				.query("workspaceMembers")
				.withIndex("by_workspace_and_user", (q) =>
					q.eq("workspaceId", workspaceId).eq("userId", memberId),
				)
				.unique(),
		);
		expect(membership?.status).toBe("active");
		expect(membership?.role).toBe("admin");
	});
});

describe("acceptInviteById / declineInviteById", () => {
	it("acceptInviteById mirrors token acceptance", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const inviteeId = await createUser(t, { email: "invitee@example.com" });
		const { inviteId } = await asUser(t, ownerId).mutation(api.workspace.inviteMember, {
			workspaceId,
			email: "invitee@example.com",
			role: "member",
		});

		await asUser(t, inviteeId).mutation(api.workspace.acceptInviteById, {
			inviteId,
		});
		const invite = await t.run((ctx) => ctx.db.get(inviteId));
		expect(invite?.status).toBe("accepted");
	});

	it("declineInviteById marks the invite declined for the recipient only", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const inviteeId = await createUser(t, { email: "invitee@example.com" });
		const wrongUserId = await createUser(t, { email: "wrong@example.com" });
		const { inviteId } = await asUser(t, ownerId).mutation(api.workspace.inviteMember, {
			workspaceId,
			email: "invitee@example.com",
			role: "member",
		});

		await expect(
			asUser(t, wrongUserId).mutation(api.workspace.declineInviteById, {
				inviteId,
			}),
		).rejects.toThrow(/different email/i);

		await asUser(t, inviteeId).mutation(api.workspace.declineInviteById, {
			inviteId,
		});
		const invite = await t.run((ctx) => ctx.db.get(inviteId));
		expect(invite?.status).toBe("declined");
	});
});

describe("revokeInvite", () => {
	it("lets an admin revoke a pending invite", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const { inviteId } = await asUser(t, ownerId).mutation(api.workspace.inviteMember, {
			workspaceId,
			email: "invitee@example.com",
			role: "member",
		});

		await asUser(t, ownerId).mutation(api.workspace.revokeInvite, {
			workspaceId,
			inviteId,
		});
		const invite = await t.run((ctx) => ctx.db.get(inviteId));
		expect(invite?.status).toBe("revoked");
	});
});

describe("updateMemberRole", () => {
	it("only the owner can change roles, and the owner's own role is protected", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const adminId = await createUser(t, { email: "admin@example.com" });
		const adminMembershipId = await addMember(t, workspaceId, adminId, "admin");

		await expect(
			asUser(t, adminId).mutation(api.workspace.updateMemberRole, {
				workspaceId,
				memberId: adminMembershipId,
				role: "member",
			}),
		).rejects.toThrow(/permission/i);

		await asUser(t, ownerId).mutation(api.workspace.updateMemberRole, {
			workspaceId,
			memberId: adminMembershipId,
			role: "member",
		});
		const membership = await t.run((ctx) => ctx.db.get(adminMembershipId));
		expect(membership?.role).toBe("member");
	});

	it("refuses to change the owner's role", async () => {
		const { t, ownerId, workspaceId } = await setup();
		const ownerMembership = await t.run((ctx) =>
			ctx.db
				.query("workspaceMembers")
				.withIndex("by_workspace_and_user", (q) =>
					q.eq("workspaceId", workspaceId).eq("userId", ownerId),
				)
				.unique(),
		);

		await expect(
			asUser(t, ownerId).mutation(api.workspace.updateMemberRole, {
				workspaceId,
				memberId: ownerMembership!._id,
				role: "member",
			}),
		).rejects.toThrow(/cannot be changed/i);
	});
});

describe("removeMember", () => {
	it("lets an admin remove a member but not another admin", async () => {
		const { t, workspaceId } = await setup();
		const adminId = await createUser(t, { email: "admin@example.com" });
		await addMember(t, workspaceId, adminId, "admin");
		const otherAdminId = await createUser(t, { email: "admin2@example.com" });
		const otherAdminMembershipId = await addMember(
			t,
			workspaceId,
			otherAdminId,
			"admin",
		);
		const memberId = await createUser(t, { email: "member@example.com" });
		const memberMembershipId = await addMember(t, workspaceId, memberId, "member");

		await expect(
			asUser(t, adminId).mutation(api.workspace.removeMember, {
				workspaceId,
				memberId: otherAdminMembershipId,
			}),
		).rejects.toThrow(/permission/i);

		await asUser(t, adminId).mutation(api.workspace.removeMember, {
			workspaceId,
			memberId: memberMembershipId,
		});
		const membership = await t.run((ctx) => ctx.db.get(memberMembershipId));
		expect(membership?.status).toBe("removed");
	});
});
