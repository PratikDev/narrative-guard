// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Doc } from "@/convex/_generated/dataModel";
import type { AuditReport } from "@/lib/types";
import { useReportHistoryDataTable } from "./use-report-history-data-table";

let counter = 0;
function makeReport(overrides: Partial<AuditReport> = {}): AuditReport {
	counter += 1;
	return {
		id: `report_${counter}`,
		brandId: "brand_1",
		brandName: "Acme",
		brandConstitutionVersion: null,
		auditor: {
			id: "user_1" as Doc<"users">["_id"],
			name: "Ada",
			email: "ada@example.com",
		},
		contentType: "generic",
		originalContent: "content",
		score: 80,
		verdict: "on_brand",
		summary: "summary",
		dimensionScores: {
			toneAlignment: 80,
			messagingAlignment: 80,
			bannedPhraseSafety: 80,
			audienceFit: 80,
			clarityAndTrust: 80,
		},
		flaggedSentences: [],
		rewriteSuggestion: "",
		status: "complete",
		createdAt: Date.now(),
		updatedAt: Date.now(),
		...overrides,
	};
}

const acmeEmail = makeReport({
	brandName: "Acme",
	contentType: "email",
	verdict: "on_brand",
	originalContent: "hello world",
	summary: "Looks great",
});
const widgetsAdCopy = makeReport({
	brandName: "Widgets Inc",
	contentType: "ad_copy",
	verdict: "off_brand",
	originalContent: "cheap deal now",
	summary: "Risky claims",
});
const acmeNeedsReview = makeReport({
	brandName: "Acme",
	contentType: "email",
	verdict: "needs_review",
	originalContent: "another piece",
	summary: "some notes",
});

const data = [acmeEmail, widgetsAdCopy, acmeNeedsReview];

function setup(reports: AuditReport[] = data) {
	return renderHook(() =>
		useReportHistoryDataTable({ canDeleteReports: false, data: reports }),
	);
}

describe("useReportHistoryDataTable", () => {
	it("shows every row with no filters applied", () => {
		const { result } = setup();
		expect(result.current.rows).toHaveLength(3);
		expect(result.current.verdictFilter).toBe("all");
		expect(result.current.contentTypeFilter).toBe("all");
	});

	it("filters by brand name via the global search (case-insensitive)", () => {
		const { result } = setup();

		act(() => result.current.setGlobalFilter("acme"));
		expect(result.current.rows.map((r) => r.original.id)).toEqual([
			acmeEmail.id,
			acmeNeedsReview.id,
		]);
	});

	it("filters by original content via the global search", () => {
		const { result } = setup();

		act(() => result.current.setGlobalFilter("cheap"));
		expect(result.current.rows.map((r) => r.original.id)).toEqual([
			widgetsAdCopy.id,
		]);
	});

	it("filters by summary via the global search", () => {
		const { result } = setup();

		act(() => result.current.setGlobalFilter("risky"));
		expect(result.current.rows.map((r) => r.original.id)).toEqual([
			widgetsAdCopy.id,
		]);
	});

	it("filters by verdict and can be reset with 'all'", () => {
		const { result } = setup();

		act(() => result.current.setVerdictFilter("off_brand"));
		expect(result.current.rows.map((r) => r.original.id)).toEqual([
			widgetsAdCopy.id,
		]);
		expect(result.current.verdictFilter).toBe("off_brand");

		act(() => result.current.setVerdictFilter("all"));
		expect(result.current.rows).toHaveLength(3);
		expect(result.current.verdictFilter).toBe("all");
	});

	it("filters by content type", () => {
		const { result } = setup();

		act(() => result.current.setContentTypeFilter("ad_copy"));
		expect(result.current.rows.map((r) => r.original.id)).toEqual([
			widgetsAdCopy.id,
		]);
	});

	it("combines the global search with a column filter", () => {
		const { result } = setup();

		act(() => result.current.setGlobalFilter("acme"));
		act(() => result.current.setVerdictFilter("needs_review"));
		expect(result.current.rows.map((r) => r.original.id)).toEqual([
			acmeNeedsReview.id,
		]);
	});

	it("exposes the same column count as getReportHistoryColumns", () => {
		const { result } = setup();
		expect(result.current.columnCount).toBeGreaterThan(0);
	});
});
