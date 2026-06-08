"use client";

import { useQuery } from "convex/react";
import { UserPlus } from "lucide-react";

import { InviteResponseButtons } from "@/components/invitations/InviteResponseButtons";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

function displayInviter(inviter: {
	name?: string | null;
	email?: string | null;
} | null) {
	return inviter?.name ?? inviter?.email ?? "A workspace admin";
}

export function PendingInvitationsCard() {
	const pendingInvites = useQuery(api.workspace.listMyPendingInvites);

	if (!pendingInvites?.length) {
		return null;
	}

	return (
		<Card className="rounded-lg">
			<CardHeader>
				<div className="flex flex-wrap items-center gap-2">
					<UserPlus className="size-4 text-muted-foreground" />
					<CardTitle>Pending invitations</CardTitle>
				</div>
				<CardDescription>
					These workspace invitations are waiting for your decision.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-3">
				{pendingInvites.map(({ invite, workspace, inviter }) => (
					<div
						key={invite._id}
						className="grid gap-3 rounded-lg border p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
					>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="font-medium">
									{workspace?.name ?? "Deleted workspace"}
								</h3>
								<Badge variant="outline">{invite.role}</Badge>
							</div>
							<p className="mt-1 text-sm text-muted-foreground">
								Invited by {displayInviter(inviter)}
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Expires {new Date(invite.expiresAt).toLocaleDateString()}
							</p>
						</div>
						<InviteResponseButtons
							inviteId={invite._id}
							size="default"
						/>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
