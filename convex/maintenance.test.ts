/// <reference types="vite/client" />
// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

// wipeAllData and seedAuditFindingsIssueType check their env gate before
// touching the database or the RAG component, so these tests never need to
// register the RAG component or seed any data.

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("wipeAllData env gating", () => {
	it("refuses to run when ENABLE_WIPE_ALL_DATA is not 'true'", async () => {
		const t = convexTest(schema, modules);
		vi.stubEnv("ENABLE_WIPE_ALL_DATA", "false");
		vi.stubEnv("WIPE_ALL_DATA_TOKEN", "secret");

		await expect(
			t.action(api.maintenance.wipeAllData, {
				confirmation: "WIPE_ALL_DATA",
				token: "secret",
			}),
		).rejects.toThrow(/ENABLE_WIPE_ALL_DATA=true/);
	});

	it("refuses to run when no token is configured", async () => {
		const t = convexTest(schema, modules);
		vi.stubEnv("ENABLE_WIPE_ALL_DATA", "true");
		vi.stubEnv("WIPE_ALL_DATA_TOKEN", "");

		await expect(
			t.action(api.maintenance.wipeAllData, {
				confirmation: "WIPE_ALL_DATA",
				token: "",
			}),
		).rejects.toThrow(/Set WIPE_ALL_DATA_TOKEN/);
	});

	it("refuses a mismatched token", async () => {
		const t = convexTest(schema, modules);
		vi.stubEnv("ENABLE_WIPE_ALL_DATA", "true");
		vi.stubEnv("WIPE_ALL_DATA_TOKEN", "secret");

		await expect(
			t.action(api.maintenance.wipeAllData, {
				confirmation: "WIPE_ALL_DATA",
				token: "wrong",
			}),
		).rejects.toThrow(/Invalid wipe token/);
	});

	it("refuses an incorrect confirmation phrase", async () => {
		const t = convexTest(schema, modules);
		vi.stubEnv("ENABLE_WIPE_ALL_DATA", "true");
		vi.stubEnv("WIPE_ALL_DATA_TOKEN", "secret");

		await expect(
			t.action(api.maintenance.wipeAllData, {
				confirmation: "please wipe everything",
				token: "secret",
			}),
		).rejects.toThrow(/Pass confirmation/);
	});
});

describe("seedAuditFindingsIssueType env gating", () => {
	it("refuses to run when ENABLE_WIPE_ALL_DATA is not 'true'", async () => {
		const t = convexTest(schema, modules);
		vi.stubEnv("ENABLE_WIPE_ALL_DATA", "false");

		await expect(
			t.action(api.maintenance.seedAuditFindingsIssueType, {
				confirmation: "SEED_AUDIT_FINDINGS_ISSUE_TYPE",
				token: "secret",
			}),
		).rejects.toThrow(/ENABLE_WIPE_ALL_DATA=true/);
	});

	it("refuses a mismatched token", async () => {
		const t = convexTest(schema, modules);
		vi.stubEnv("ENABLE_WIPE_ALL_DATA", "true");
		vi.stubEnv("WIPE_ALL_DATA_TOKEN", "secret");

		await expect(
			t.action(api.maintenance.seedAuditFindingsIssueType, {
				confirmation: "SEED_AUDIT_FINDINGS_ISSUE_TYPE",
				token: "wrong",
			}),
		).rejects.toThrow(/Invalid maintenance token/);
	});
});
