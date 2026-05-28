"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { MoreHorizontal, Shield, Trash2, UserPlus } from "lucide-react";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { CopyButton } from "@/components/shared/CopyButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { Doc, Id } from "@/convex/_generated/dataModel";

type InviteRole = "admin" | "member";

function canManageMembers(role: Doc<"workspaceMembers">["role"] | undefined) {
	return role === "owner" || role === "admin";
}

function canInviteRole(
	actorRole: Doc<"workspaceMembers">["role"] | undefined,
	inviteRole: InviteRole,
) {
	if (actorRole === "owner") return true;
	if (actorRole === "admin") return inviteRole === "member";
	return false;
}

function roleBadgeVariant(role: Doc<"workspaceMembers">["role"]) {
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
	const revokeInvite = useMutation(api.workspace.revokeInvite);
	const removeMember = useMutation(api.workspace.removeMember);
	const updateMemberRole = useMutation(api.workspace.updateMemberRole);
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<InviteRole>("member");
	const [inviteUrl, setInviteUrl] = useState("");
	const [statusMessage, setStatusMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	if (isLoading || !workspaceId || !activeWorkspace || !activeMembership) {
		return <LoadingState label="Loading team" />;
	}

	const actorRole = activeMembership.role;
	const canManageTeam = canManageMembers(actorRole);

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
						{errorMessage ? (
							<p className="text-sm text-destructive">{errorMessage}</p>
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
											{canManageTeam && member.role !== "owner" ? (
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
														{member.role === "member" || actorRole === "owner" ? (
															<DropdownMenuItem
																variant="destructive"
																onSelect={() => handleRemove(member._id)}
															>
																<Trash2 data-icon="inline-start" />
																Remove
															</DropdownMenuItem>
														) : null}
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
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => handleRevoke(invite._id)}
												>
													Revoke
												</Button>
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
