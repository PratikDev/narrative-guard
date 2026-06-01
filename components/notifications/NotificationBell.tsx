"use client";

import { useMutation, useQuery } from "convex/react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { APP_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Notification = Doc<"notifications">;
type NotificationListItem = Notification & {
	inviteStatus: Doc<"workspaceInvites">["status"] | null;
	inviteExpiresAt: number | null;
	inviteCanRespond: boolean;
};

function notificationHref(notification: Notification) {
	if (
		(notification.type === "audit_completed" ||
			notification.type === "audit_failed") &&
		notification.reportId
	) {
		return `/reports/${notification.reportId}`;
	}

	if (
		notification.type === "workspace_invitation_received" ||
		notification.type === "workspace_invitation_accepted" ||
		notification.type === "workspace_role_changed"
	) {
		return APP_ROUTES.team;
	}

	return APP_ROUTES.dashboard;
}

function formatNotificationTime(createdAt: number) {
	return new Intl.DateTimeFormat(undefined, {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(createdAt));
}

export function NotificationBell() {
	const router = useRouter();
	const notifications = useQuery(api.notifications.listMine);
	const unreadCount = useQuery(api.notifications.unreadCount);
	const markAsRead = useMutation(api.notifications.markAsRead);
	const markAllAsRead = useMutation(api.notifications.markAllAsRead);
	const acceptInviteById = useMutation(api.workspace.acceptInviteById);
	const declineInviteById = useMutation(api.workspace.declineInviteById);
	const [processingInviteId, setProcessingInviteId] = useState<
		Notification["inviteId"] | null
	>(null);
	const visibleUnreadCount = unreadCount ?? 0;

	function canRespondToInvite(notification: NotificationListItem) {
		return (
			notification.type === "workspace_invitation_received" &&
			Boolean(notification.inviteId) &&
			notification.inviteStatus === "pending" &&
			notification.inviteCanRespond
		);
	}

	async function handleNotificationSelect(notification: NotificationListItem) {
		if (!notification.readAt) {
			await markAsRead({ notificationId: notification._id });
		}

		router.push(notificationHref(notification));
	}

	async function handleInviteResponse(
		event: MouseEvent<HTMLButtonElement>,
		notification: NotificationListItem,
		action: "accept" | "decline",
	) {
		event.preventDefault();
		event.stopPropagation();

		if (!notification.inviteId) return;

		setProcessingInviteId(notification.inviteId);

		try {
			if (action === "accept") {
				await acceptInviteById({ inviteId: notification.inviteId });
				toast.success("Invitation accepted", {
					description: "You can now access the workspace.",
				});
				return;
			}

			await declineInviteById({ inviteId: notification.inviteId });
			toast.success("Invitation declined");
		} catch (error) {
			toast.error("Could not update invitation", {
				description:
					error instanceof Error ? error.message : "Please try again.",
			});
		} finally {
			setProcessingInviteId(null);
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative"
					aria-label="Open notifications"
				>
					<Bell />
					{visibleUnreadCount > 0 ? (
						<span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-medium text-accent">
							{visibleUnreadCount > 9 ? "9+" : visibleUnreadCount}
						</span>
					) : null}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				className="w-96 max-w-[calc(100vw-2rem)]"
			>
				<div className="flex items-center justify-between gap-3 px-2 py-1">
					<DropdownMenuLabel className="px-0">Notifications</DropdownMenuLabel>
					<Button
						variant="ghost"
						size="sm"
						disabled={!visibleUnreadCount}
						onClick={() => void markAllAsRead({})}
					>
						<CheckCheck data-icon="inline-start" />
						Mark all read
					</Button>
				</div>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					{notifications === undefined ? (
						<div className="px-2 py-6 text-center text-sm text-muted-foreground">
							Loading notifications...
						</div>
					) : notifications.length ? (
						notifications.map((notification) => (
							<DropdownMenuItem
								key={notification._id}
								className="items-start gap-3 p-3 cursor-pointer"
								onSelect={() => handleNotificationSelect(notification)}
							>
								<span
									className={cn(
										"mt-1 size-2 rounded-full",
										notification.readAt ? "bg-muted" : "bg-primary",
									)}
								/>

								<span className="min-w-0 flex-1">
									<span className="block truncate font-medium">
										{notification.title}
									</span>
									<span className="mt-1 block text-wrap text-muted-foreground">
										{notification.message}
									</span>
									<span className="mt-2 block text-xs text-muted-foreground">
										{formatNotificationTime(notification.createdAt)}
									</span>
									{canRespondToInvite(notification) ? (
										<span
											className="mt-3 flex gap-2"
											onClick={(event) => event.stopPropagation()}
											onPointerDown={(event) => event.stopPropagation()}
										>
											<Button
												type="button"
												size="sm"
												disabled={processingInviteId === notification.inviteId}
												onClick={(event) =>
													void handleInviteResponse(
														event,
														notification,
														"accept",
													)
												}
											>
												<Check data-icon="inline-start" />
												Accept
											</Button>
											<Button
												type="button"
												variant="outline"
												size="sm"
												disabled={processingInviteId === notification.inviteId}
												onClick={(event) =>
													void handleInviteResponse(
														event,
														notification,
														"decline",
													)
												}
											>
												<X data-icon="inline-start" />
												Reject
											</Button>
										</span>
									) : null}
								</span>
							</DropdownMenuItem>
						))
					) : (
						<div className="px-2 py-6 text-center text-sm text-muted-foreground">
							No notifications yet.
						</div>
					)}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
