/// <reference types="vite/client" />
// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { asUser, createUser, type T } from "./test/seed";

const modules = import.meta.glob("./**/*.ts");

async function insertNotification(t: T, userId: Id<"users">, readAt?: number) {
	return await t.run((ctx) =>
		ctx.db.insert("notifications", {
			userId,
			scope: "user",
			type: "audit_completed",
			title: "Audit completed",
			message: "Your audit finished.",
			readAt,
			createdAt: Date.now(),
		}),
	);
}

describe("unreadCount", () => {
	it("counts only notifications without a readAt", async () => {
		const t = convexTest(schema, modules);
		const userId = await createUser(t);
		await insertNotification(t, userId);
		await insertNotification(t, userId);
		await insertNotification(t, userId, Date.now());

		const count = await asUser(t, userId).query(api.notifications.unreadCount, {});
		expect(count).toBe(2);
	});

	it("requires authentication", async () => {
		const t = convexTest(schema, modules);
		await expect(t.query(api.notifications.unreadCount, {})).rejects.toThrow();
	});
});

describe("markAsRead", () => {
	it("marks the caller's own notification read", async () => {
		const t = convexTest(schema, modules);
		const userId = await createUser(t);
		const notificationId = await insertNotification(t, userId);

		await asUser(t, userId).mutation(api.notifications.markAsRead, {
			notificationId,
		});
		const notification = await t.run((ctx) => ctx.db.get(notificationId));
		expect(notification?.readAt).toBeTypeOf("number");
	});

	it("refuses to mark someone else's notification read", async () => {
		const t = convexTest(schema, modules);
		const userId = await createUser(t);
		const otherUserId = await createUser(t, { email: "other@example.com" });
		const notificationId = await insertNotification(t, userId);

		await expect(
			asUser(t, otherUserId).mutation(api.notifications.markAsRead, {
				notificationId,
			}),
		).rejects.toThrow(/not found/i);
	});
});

describe("markAllAsRead", () => {
	it("marks every unread notification for the caller and reports the count", async () => {
		const t = convexTest(schema, modules);
		const userId = await createUser(t);
		await insertNotification(t, userId);
		await insertNotification(t, userId);
		await insertNotification(t, userId, Date.now()); // already read

		const result = await asUser(t, userId).mutation(
			api.notifications.markAllAsRead,
			{},
		);
		expect(result.markedRead).toBe(2);

		const remainingUnread = await asUser(t, userId).query(
			api.notifications.unreadCount,
			{},
		);
		expect(remainingUnread).toBe(0);
	});
});
