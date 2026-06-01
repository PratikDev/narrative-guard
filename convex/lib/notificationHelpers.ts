import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

type NotificationScope = "user" | "workspace";

type NotificationType =
  | "audit_completed"
  | "audit_failed"
  | "workspace_invitation_received"
  | "workspace_invitation_accepted"
  | "workspace_role_changed";

type CreateNotificationArgs = {
  userId: Id<"users">;
  actorUserId?: Id<"users">;
  workspaceId?: Id<"workspaces">;
  brandId?: Id<"brands">;
  reportId?: Id<"auditReports">;
  inviteId?: Id<"workspaceInvites">;
  scope: NotificationScope;
  type: NotificationType;
  title: string;
  message: string;
  createdAt?: number;
};

type CreateNotificationsForUsersArgs = Omit<CreateNotificationArgs, "userId"> & {
  userIds: Id<"users">[];
};

type NotifyWorkspaceMembersArgs = Omit<
  CreateNotificationsForUsersArgs,
  "userIds" | "scope"
> & {
  workspaceId: Id<"workspaces">;
  excludeUserIds?: Id<"users">[];
};

export async function createNotification(
  ctx: MutationCtx,
  args: CreateNotificationArgs
) {
  return await ctx.db.insert("notifications", {
    userId: args.userId,
    actorUserId: args.actorUserId,
    workspaceId: args.workspaceId,
    brandId: args.brandId,
    reportId: args.reportId,
    inviteId: args.inviteId,
    scope: args.scope,
    type: args.type,
    title: args.title,
    message: args.message,
    createdAt: args.createdAt ?? Date.now(),
  });
}

export async function createNotificationsForUsers(
  ctx: MutationCtx,
  args: CreateNotificationsForUsersArgs
) {
  const { userIds, ...notification } = args;
  const uniqueUserIds = [...new Set(userIds)];

  for (const userId of uniqueUserIds) {
    await createNotification(ctx, {
      ...notification,
      userId,
    });
  }
}

export async function notifyWorkspaceMembers(
  ctx: MutationCtx,
  args: NotifyWorkspaceMembersArgs
) {
  const { excludeUserIds, ...notification } = args;
  const excludedUserIds = new Set(excludeUserIds ?? []);
  const members = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
    .collect();
  const userIds = members
    .filter((member) => {
      return member.status === "active" && !excludedUserIds.has(member.userId);
    })
    .map((member) => member.userId);

  await createNotificationsForUsers(ctx, {
    ...notification,
    userIds,
    scope: "workspace",
  });
}
