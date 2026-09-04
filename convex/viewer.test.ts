/// <reference types="vite/client" />
// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";
import { asUser, createUser } from "./test/seed";

const modules = import.meta.glob("./**/*.ts");

describe("currentUser", () => {
	it("returns null when signed out", async () => {
		const t = convexTest(schema, modules);
		expect(await t.query(api.viewer.currentUser, {})).toBeNull();
	});

	it("returns the signed-in user's document", async () => {
		const t = convexTest(schema, modules);
		const userId = await createUser(t, { name: "Ada", email: "ada@example.com" });

		const user = await asUser(t, userId).query(api.viewer.currentUser, {});
		expect(user?._id).toBe(userId);
		expect(user?.email).toBe("ada@example.com");
	});
});
