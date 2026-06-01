import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthUserId } from "./lib/requireAuth";

const NOTIFICATION_PAGE_SIZE = 30;
const MARK_ALL_READ_LIMIT = 100;

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);

    return await ctx.db
      .query("notifications")
      .withIndex("by_user_and_created_at", (q) => q.eq("userId", userId))
      .order("desc")
      .take(NOTIFICATION_PAGE_SIZE);
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read_at_and_created_at", (q) =>
        q.eq("userId", userId).eq("readAt", undefined)
      )
      .take(MARK_ALL_READ_LIMIT);

    return unreadNotifications.length;
  },
});

export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const notification = await ctx.db.get(args.notificationId);

    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found.");
    }

    if (!notification.readAt) {
      await ctx.db.patch(args.notificationId, { readAt: Date.now() });
    }

    return { notificationId: args.notificationId };
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const now = Date.now();
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read_at_and_created_at", (q) =>
        q.eq("userId", userId).eq("readAt", undefined)
      )
      .take(MARK_ALL_READ_LIMIT);

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { readAt: now });
    }

    return { markedRead: unreadNotifications.length };
  },
});
