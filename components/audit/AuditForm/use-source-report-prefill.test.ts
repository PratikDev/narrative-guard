// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSourceReportPrefill } from "./use-source-report-prefill";

const mocks = vi.hoisted(() => ({
	getReportWithFindingsRef: Symbol("getReportWithFindings"),
	query: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
	api: { report: { getReportWithFindings: mocks.getReportWithFindingsRef } },
}));

vi.mock("convex/react", () => ({
	useConvex: () => ({ query: mocks.query }),
}));

beforeEach(() => {
	mocks.query.mockReset();
});

describe("useSourceReportPrefill", () => {
	it("stays idle and never queries when there is no source report id", async () => {
		const onPrefill = vi.fn();
		const { result } = renderHook(() =>
			useSourceReportPrefill({ sourceReportId: undefined, onPrefill }),
		);

		expect(result.current.status).toBe("idle");
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(mocks.query).not.toHaveBeenCalled();
	});

	it("prefills the form from the source report and returns to idle", async () => {
		mocks.query.mockResolvedValue({
			brandId: "brand_1",
			contentType: "email",
			rewriteSuggestion: "Better copy.",
		});
		const onPrefill = vi.fn();

		const { result } = renderHook(() =>
			useSourceReportPrefill({
				sourceReportId: "report_1",
				workspaceId: "ws_1" as never,
				onPrefill,
			}),
		);

		await waitFor(() => expect(result.current.status).toBe("idle"));
		expect(onPrefill).toHaveBeenCalledWith({
			brandId: "brand_1",
			contentType: "email",
			rewriteSuggestion: "Better copy.",
		});
		expect(mocks.query).toHaveBeenCalledWith(mocks.getReportWithFindingsRef, {
			workspaceId: "ws_1",
			reportId: "report_1",
		});
	});

	it("fails gracefully when the source report cannot be found", async () => {
		mocks.query.mockResolvedValue(null);
		const onPrefill = vi.fn();

		const { result } = renderHook(() =>
			useSourceReportPrefill({ sourceReportId: "report_missing", onPrefill }),
		);

		await waitFor(() => expect(result.current.status).toBe("failed"));
		expect(result.current.message).toMatch(/could not be found/i);
		expect(onPrefill).not.toHaveBeenCalled();
	});

	it("fails gracefully when the query throws", async () => {
		mocks.query.mockRejectedValue(new Error("network error"));
		const onPrefill = vi.fn();

		const { result } = renderHook(() =>
			useSourceReportPrefill({ sourceReportId: "report_1", onPrefill }),
		);

		await waitFor(() => expect(result.current.status).toBe("failed"));
		expect(result.current.message).toMatch(/could not be loaded/i);
	});

	it("does not re-fetch on a rerender with the same source report id", async () => {
		mocks.query.mockResolvedValue({
			brandId: "brand_1",
			contentType: "email",
			rewriteSuggestion: "Better copy.",
		});
		const onPrefill = vi.fn();

		const { result, rerender } = renderHook(
			(props: { sourceReportId: string }) =>
				useSourceReportPrefill({ ...props, onPrefill }),
			{ initialProps: { sourceReportId: "report_1" } },
		);

		await waitFor(() => expect(result.current.status).toBe("idle"));
		expect(mocks.query).toHaveBeenCalledTimes(1);

		rerender({ sourceReportId: "report_1" });
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(mocks.query).toHaveBeenCalledTimes(1);
	});
});
