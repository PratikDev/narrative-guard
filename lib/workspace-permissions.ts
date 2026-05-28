import type { Doc } from "@/convex/_generated/dataModel";

export type WorkspaceRole = Doc<"workspaceMembers">["role"];

export function canManageBrands(role: WorkspaceRole | undefined) {
	return role === "owner" || role === "admin";
}

export function canDeleteReports(role: WorkspaceRole | undefined) {
	return role === "owner" || role === "admin";
}

export function canManageWorkspaceSettings(role: WorkspaceRole | undefined) {
	return role === "owner";
}

export function canInviteRole(
	actorRole: WorkspaceRole | undefined,
	inviteRole: Exclude<WorkspaceRole, "owner">,
) {
	if (actorRole === "owner") return true;
	if (actorRole === "admin") return inviteRole === "member";
	return false;
}

export function canManageWorkspaceMember(
	actorRole: WorkspaceRole | undefined,
	targetRole: WorkspaceRole | undefined,
) {
	if (actorRole === "owner") return targetRole !== "owner";
	if (actorRole === "admin") return targetRole === "member";
	return false;
}
