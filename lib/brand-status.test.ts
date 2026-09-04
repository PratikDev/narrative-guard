import { describe, expect, it } from "vitest";

import {
	BRAND_RAG_STATUS_LABELS,
	getBrandRagStatusClass,
	normalizeBrandRagStatus,
} from "./brand-status";

describe("normalizeBrandRagStatus", () => {
	it("defaults a missing status to 'not_indexed'", () => {
		expect(normalizeBrandRagStatus(undefined)).toBe("not_indexed");
	});

	it("passes concrete statuses through unchanged", () => {
		expect(normalizeBrandRagStatus("indexing")).toBe("indexing");
		expect(normalizeBrandRagStatus("ready")).toBe("ready");
		expect(normalizeBrandRagStatus("failed")).toBe("failed");
		expect(normalizeBrandRagStatus("not_indexed")).toBe("not_indexed");
	});
});

describe("BRAND_RAG_STATUS_LABELS", () => {
	it("has a human label for every normalized status", () => {
		expect(BRAND_RAG_STATUS_LABELS).toEqual({
			not_indexed: "Not indexed",
			indexing: "Indexing",
			ready: "Ready",
			failed: "Failed",
		});
	});
});

describe("getBrandRagStatusClass", () => {
	it("uses a distinct class per status and treats undefined as not_indexed", () => {
		const ready = getBrandRagStatusClass("ready");
		const failed = getBrandRagStatusClass("failed");
		const indexing = getBrandRagStatusClass("indexing");
		const notIndexed = getBrandRagStatusClass("not_indexed");

		expect(new Set([ready, failed, indexing, notIndexed]).size).toBe(4);
		expect(getBrandRagStatusClass(undefined)).toBe(notIndexed);
		expect(ready).toContain("text-primary");
		expect(failed).toContain("text-destructive");
	});
});
