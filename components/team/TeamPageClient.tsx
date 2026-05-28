"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
	AlertCircle,
	MoreHorizontal,
	Settings,
	Shield,
	Trash2,
	UserPlus,
} from "lucide-react";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { CopyButton } from "@/components/shared/CopyButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	canInviteRole,
	canManageWorkspaceMember,
	canManageWorkspaceSettings,
	type WorkspaceRole,
} from "@/lib/workspace-permissions";

type InviteRole = "admin" | "member";

function canManageMembers(role: WorkspaceRole | undefined) {
	return role === "owner" || role === "admin";
}

function roleBadgeVariant(role: WorkspaceRole) {
	if (role === "owner") return "default";
	if (role === "admin") return "secondary";
	return "outline";
}

export function TeamPageClient() {
	const { activeMembership, activeWorkspace, isLoading, workspaceId } =
		useWorkspace();
	const memberArgs = workspaceId ? { workspaceId } : "skip";
	const inviteArgs =
		workspaceId && canManageMembers(activeMembership?.role)
			? { workspaceId }
			: "skip";
	const members = useQuery(api.workspace.listMembers, memberArgs);
	const invites = useQuery(api.workspace.listInvites, inviteArgs);
	const inviteMember = useMutation(api.workspace.inviteMember);
	const updateWorkspace = useMutation(api.workspace.updateWorkspace);
	const revokeInvite = useMutation(api.workspace.revokeInvite);
	const removeMember = useMutation(api.workspace.removeMember);
	const updateMemberRole = useMutation(api.workspace.updateMemberRole);
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<InviteRole>("member");
	const [inviteUrl, setInviteUrl] = useState("");
	const [workspaceNameDraft, setWorkspaceNameDraft] = useState<string | null>(
		null,
	);
	const [statusMessage, setStatusMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	if (isLoading || !workspaceId || !activeWorkspace || !activeMembership) {
		return <LoadingState label="Loading team" />;
	}

	const actorRole = activeMembership.role;
	const canManageTeam = canManageMembers(actorRole);
	const canManageSettings = canManageWorkspaceSettings(actorRole);
	const workspaceName = workspaceNameDraft ?? activeWorkspace.name;

	async function handleUpdateWorkspace() {
		if (!workspaceId || !canManageSettings || !workspaceName.trim()) return;

		setErrorMessage("");
		setStatusMessage("");

		try {
			await updateWorkspace({
				workspaceId,
				name: workspaceName,
			});
			setWorkspaceNameDraft(null);
			setStatusMessage("Workspace settings updated.");
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Could not update workspace.",
			);
		}
	}

	async function handleInvite() {
		if (!workspaceId || !canInviteRole(actorRole, role)) return;

		setErrorMessage("");
		setStatusMessage("");
		setInviteUrl("");

		try {
			const result = await inviteMember({
				workspaceId,
				email,
				role,
			});
			setInviteUrl(`${window.location.origin}${result.invitePath}`);
			setStatusMessage("Invite link created.");
			setEmail("");
			setRole("member");
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Could not create invite.",
			);
		}
	}

	async function handleRevoke(inviteId: Id<"workspaceInvites">) {
		if (!workspaceId) return;

		setErrorMessage("");
		await revokeInvite({ workspaceId, inviteId }).catch((error) => {
			setErrorMessage(
				error instanceof Error ? error.message : "Could not revoke invite.",
			);
		});
	}

	async function handleRoleChange(
		memberId: Id<"workspaceMembers">,
		nextRole: InviteRole,
	) {
		if (!workspaceId) return;

		setErrorMessage("");
		await updateMemberRole({ workspaceId, memberId, role: nextRole }).catch(
			(error) => {
				setErrorMessage(
					error instanceof Error ? error.message : "Could not update role.",
				);
			},
		);
	}

	async function handleRemove(memberId: Id<"workspaceMembers">) {
		if (!workspaceId) return;

		setErrorMessage("");
		await removeMember({ workspaceId, memberId }).catch((error) => {
			setErrorMessage(
				error instanceof Error ? error.message : "Could not remove member.",
			);
		});
	}

	return (
		<div className="space-y-6">
			<Card className="rounded-lg">
				<CardHeader>
					<CardTitle>{activeWorkspace.name}</CardTitle>
					<CardDescription>
						Manage who can audit content, edit brands, and administer this
						workspace.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2 text-sm">
						<Shield className="size-4 text-muted-foreground" />
						Your role
						<Badge variant={roleBadgeVariant(actorRole)}>{actorRole}</Badge>
					</div>
				</CardContent>
			</Card>

			{errorMessage ? (
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertTitle>Team action failed</AlertTitle>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			) : null}

			<Card className="rounded-lg">
				<CardHeader>
					<CardTitle>Role guide</CardTitle>
					<CardDescription>
						Workspace permissions define who can maintain brands, manage team
						access, and review audit history.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-3">
					<div className="rounded-lg border p-3">
						<Badge>owner</Badge>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Can rename the workspace, change member roles, remove admins or
							members, manage brands, run audits, and view reports.
						</p>
					</div>
					<div className="rounded-lg border p-3">
						<Badge variant="secondary">admin</Badge>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Can create and edit brands, invite or remove members, run audits,
							and view reports.
						</p>
					</div>
					<div className="rounded-lg border p-3">
						<Badge variant="outline">member</Badge>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Can read brand constitutions, run audits, and view report history.
						</p>
					</div>
				</CardContent>
			</Card>

			{canManageSettings ? (
				<Card className="rounded-lg">
					<CardHeader>
						<CardTitle>Workspace settings</CardTitle>
						<CardDescription>
							Only owners can change workspace-level settings.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
							<label className="grid gap-2 text-sm font-medium">
								Workspace name
								<Input
									value={workspaceName}
									onChange={(event) =>
										setWorkspaceNameDraft(event.target.value)
									}
								/>
							</label>
							<Button
								type="button"
								className="self-end"
								onClick={handleUpdateWorkspace}
								disabled={!workspaceName.trim()}
							>
								<Settings data-icon="inline-start" />
								Save settings
							</Button>
						</div>
						<div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
							<p>
								Members: <span className="text-foreground">{members?.length ?? 0}</span>
							</p>
							<p>
								Created:{" "}
								<span className="text-foreground">
									{new Date(activeWorkspace.createdAt).toLocaleDateString()}
								</span>
							</p>
							<p>
								Workspace ID:{" "}
								<span className="text-foreground">{activeWorkspace._id}</span>
							</p>
						</div>
					</CardContent>
				</Card>
			) : null}

			{canManageTeam ? (
				<Card className="rounded-lg">
					<CardHeader>
						<CardTitle>Invite teammate</CardTitle>
						<CardDescription>
							Create a link that the invited person can open after signing in.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
							<Input
								type="email"
								value={email}
								placeholder="teammate@example.com"
								onChange={(event) => setEmail(event.target.value)}
							/>
							<Select
								value={role}
								onValueChange={(value) => setRole(value as InviteRole)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="member">Member</SelectItem>
									{actorRole === "owner" ? (
										<SelectItem value="admin">Admin</SelectItem>
									) : null}
								</SelectContent>
							</Select>
							<Button
								type="button"
								onClick={handleInvite}
								disabled={!email.trim() || !canInviteRole(actorRole, role)}
							>
								<UserPlus data-icon="inline-start" />
								Invite
							</Button>
						</div>
						{statusMessage ? (
							<p className="text-sm text-muted-foreground">{statusMessage}</p>
						) : null}
						{inviteUrl ? (
							<div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
								<p className="min-w-0 flex-1 truncate text-sm">{inviteUrl}</p>
								<CopyButton content={inviteUrl} />
							</div>
						) : null}
					</CardContent>
				</Card>
			) : null}

			<Card className="rounded-lg">
				<CardHeader>
					<CardTitle>Members</CardTitle>
				</CardHeader>
				<CardContent>
					{members === undefined ? (
						<LoadingState label="Loading members" />
					) : members.length ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead className="w-10" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{members.map(({ member, user }) => (
									<TableRow key={member._id}>
										<TableCell className="font-medium">
											{user?.name ?? "Unknown user"}
										</TableCell>
										<TableCell>{user?.email ?? "No email"}</TableCell>
										<TableCell>
											<Badge variant={roleBadgeVariant(member.role)}>
												{member.role}
											</Badge>
										</TableCell>
										<TableCell>
											{canManageWorkspaceMember(actorRole, member.role) ? (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															type="button"
															variant="ghost"
															size="icon-sm"
															aria-label="Member actions"
														>
															<MoreHorizontal />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														{actorRole === "owner" ? (
															<>
																<DropdownMenuItem
																	onSelect={() =>
																		handleRoleChange(member._id, "member")
																	}
																>
																	Make member
																</DropdownMenuItem>
																<DropdownMenuItem
																	onSelect={() =>
																		handleRoleChange(member._id, "admin")
																	}
																>
																	Make admin
																</DropdownMenuItem>
															</>
														) : null}
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<DropdownMenuItem
																	variant="destructive"
																	onSelect={(event) => event.preventDefault()}
																>
																	<Trash2 data-icon="inline-start" />
																	Remove
																</DropdownMenuItem>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		Remove this member?
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		This removes access to the selected
																		workspace. Existing reports and audits stay
																		in the workspace.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>Cancel</AlertDialogCancel>
																	<Button
																		type="button"
																		variant="destructive"
																		onClick={() => handleRemove(member._id)}
																	>
																		Remove member
																	</Button>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													</DropdownMenuContent>
												</DropdownMenu>
											) : null}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<EmptyState
							title="No members"
							description="This workspace does not have active members yet."
						/>
					)}
				</CardContent>
			</Card>

			{canManageTeam ? (
				<Card className="rounded-lg">
					<CardHeader>
						<CardTitle>Pending invites</CardTitle>
					</CardHeader>
					<CardContent>
						{invites === undefined ? (
							<LoadingState label="Loading invites" />
						) : invites.length ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Email</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Expires</TableHead>
										<TableHead className="text-right">Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{invites.map((invite) => (
										<TableRow key={invite._id}>
											<TableCell className="font-medium">
												{invite.email}
											</TableCell>
											<TableCell>
												<Badge variant="outline">{invite.role}</Badge>
											</TableCell>
											<TableCell>
												{new Date(invite.expiresAt).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right">
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															type="button"
															variant="outline"
															size="sm"
														>
															Revoke
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Revoke this invite?
															</AlertDialogTitle>
															<AlertDialogDescription>
																This invite link will stop working
																immediately. Existing members are not affected.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<Button
																type="button"
																variant="destructive"
																onClick={() => handleRevoke(invite._id)}
															>
																Revoke invite
															</Button>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<p className="text-sm text-muted-foreground">
								No pending invites.
							</p>
						)}
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
