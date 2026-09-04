import { describe, expect, it } from "vitest";

import {
	canDeleteReports,
	canInviteRole,
	canManageBrands,
	canManageWorkspaceMember,
	canManageWorkspaceSettings,
	type WorkspaceRole,
} from "./workspace-permissions";

const ROLES: (WorkspaceRole | undefined)[] = [
	"owner",
	"admin",
	"member",
	undefined,
];

describe("canManageBrands / canDeleteReports", () => {
	it("allow owner and admin only", () => {
		for (const check of [canManageBrands, canDeleteReports]) {
			expect(check("owner")).toBe(true);
			expect(check("admin")).toBe(true);
			expect(check("member")).toBe(false);
			expect(check(undefined)).toBe(false);
		}
	});
});

describe("canManageWorkspaceSettings", () => {
	it("allows owner only", () => {
		expect(canManageWorkspaceSettings("owner")).toBe(true);
		expect(canManageWorkspaceSettings("admin")).toBe(false);
		expect(canManageWorkspaceSettings("member")).toBe(false);
		expect(canManageWorkspaceSettings(undefined)).toBe(false);
	});
});

describe("canInviteRole", () => {
	it("lets an owner invite admins and members", () => {
		expect(canInviteRole("owner", "admin")).toBe(true);
		expect(canInviteRole("owner", "member")).toBe(true);
	});

	it("lets an admin invite members but not admins", () => {
		expect(canInviteRole("admin", "member")).toBe(true);
		expect(canInviteRole("admin", "admin")).toBe(false);
	});

	it("never lets a member (or an unknown role) invite", () => {
		expect(canInviteRole("member", "member")).toBe(false);
		expect(canInviteRole("member", "admin")).toBe(false);
		expect(canInviteRole(undefined, "member")).toBe(false);
	});
});

describe("canManageWorkspaceMember", () => {
	it("lets an owner manage everyone except another owner", () => {
		expect(canManageWorkspaceMember("owner", "admin")).toBe(true);
		expect(canManageWorkspaceMember("owner", "member")).toBe(true);
		expect(canManageWorkspaceMember("owner", "owner")).toBe(false);
	});

	it("lets an admin manage members only", () => {
		expect(canManageWorkspaceMember("admin", "member")).toBe(true);
		expect(canManageWorkspaceMember("admin", "admin")).toBe(false);
		expect(canManageWorkspaceMember("admin", "owner")).toBe(false);
	});

	it("never lets a member or unknown role manage anyone", () => {
		for (const target of ["owner", "admin", "member"] as const) {
			expect(canManageWorkspaceMember("member", target)).toBe(false);
			expect(canManageWorkspaceMember(undefined, target)).toBe(false);
		}
	});
});

describe("permission helpers", () => {
	it("never throw for any (role, target) combination", () => {
		for (const role of ROLES) {
			expect(() => canManageBrands(role)).not.toThrow();
			expect(() => canDeleteReports(role)).not.toThrow();
			expect(() => canManageWorkspaceSettings(role)).not.toThrow();
			for (const target of ["admin", "member"] as const) {
				expect(() => canInviteRole(role, target)).not.toThrow();
			}
		}
	});
});
