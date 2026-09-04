// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Doc } from "@/convex/_generated/dataModel";
import type { AuditReport } from "@/lib/types";
import { AuditReportStatusBadge } from "./AuditReportStatusBadge";

function makeReport(overrides: Partial<AuditReport>): AuditReport {
	return {
		id: "report_1",
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

describe("AuditReportStatusBadge", () => {
	it("shows a neutral 'Processing' badge while the audit is running", () => {
		render(<AuditReportStatusBadge report={makeReport({ status: "processing" })} />);
		expect(screen.getByText("Processing")).toBeInTheDocument();
	});

	it("shows a destructive 'Failed' badge when the audit failed", () => {
		render(<AuditReportStatusBadge report={makeReport({ status: "failed" })} />);
		expect(screen.getByText("Failed")).toHaveClass("text-destructive");
	});

	it("falls back to the verdict badge once complete", () => {
		render(
			<AuditReportStatusBadge
				report={makeReport({ status: "complete", verdict: "off_brand" })}
			/>,
		);
		expect(screen.getByText("Off Brand")).toBeInTheDocument();
	});
});
