import { describe, expect, it } from "vitest";

import type { AuditReport } from "@/lib/types";
import { isCompletedAuditReport, isFailedAuditReport } from "./audit-report";

function reportWithStatus(status: AuditReport["status"]): AuditReport {
	return { status } as AuditReport;
}

describe("isCompletedAuditReport", () => {
	it("is true only for the 'complete' status", () => {
		expect(isCompletedAuditReport(reportWithStatus("complete"))).toBe(true);
		for (const status of ["idle", "processing", "failed"] as const) {
			expect(isCompletedAuditReport(reportWithStatus(status))).toBe(false);
		}
	});
});

describe("isFailedAuditReport", () => {
	it("is true only for the 'failed' status", () => {
		expect(isFailedAuditReport(reportWithStatus("failed"))).toBe(true);
		for (const status of ["idle", "processing", "complete"] as const) {
			expect(isFailedAuditReport(reportWithStatus(status))).toBe(false);
		}
	});
});
