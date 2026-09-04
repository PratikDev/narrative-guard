import { describe, expect, it } from "vitest";

import { canManageWorkspaceMember, hasWorkspaceRole } from "./workspaceAuth";

// Only the pure, ctx-free helpers are covered here. The DB-backed helpers
// (requireWorkspaceMember, resolveWorkspaceForMutation, ...) are exercised in
// the convex-test backend suite.

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
