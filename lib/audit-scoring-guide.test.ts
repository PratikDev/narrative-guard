import { describe, expect, it } from "vitest";

import { AUDIT_FINDING_PENALTIES } from "@/convex/lib/auditScoring";
import {
	BASE_ISSUE_PENALTIES,
	FINDING_SEVERITIES,
	SCORING_GUIDE_CONTENT_TYPES,
	SCORING_GUIDE_ISSUE_TYPES,
	SCORING_GUIDE_SCORE_CAPS,
	formatWeightPercent,
	getStrictnessLabel,
} from "./audit-scoring-guide";

describe("formatWeightPercent", () => {
	it("renders a weight fraction as a rounded percentage", () => {
		expect(formatWeightPercent(0.25)).toBe("25%");
		expect(formatWeightPercent(0.3)).toBe("30%");
		expect(formatWeightPercent(0.155)).toBe("16%");
		expect(formatWeightPercent(0)).toBe("0%");
	});
});

describe("getStrictnessLabel", () => {
	it("buckets penalty multipliers into strictness bands", () => {
		expect(getStrictnessLabel(0.8)).toBe("More forgiving");
		expect(getStrictnessLabel(1)).toBe("Standard");
		expect(getStrictnessLabel(1.1)).toBe("Stricter");
		expect(getStrictnessLabel(1.24)).toBe("Stricter");
		expect(getStrictnessLabel(1.25)).toBe("Much stricter");
		expect(getStrictnessLabel(1.5)).toBe("Much stricter");
	});
});

describe("scoring guide derived arrays", () => {
	it("expose all six content types, five issue types, four caps and three severities", () => {
		expect(SCORING_GUIDE_CONTENT_TYPES).toHaveLength(6);
		expect(SCORING_GUIDE_ISSUE_TYPES).toHaveLength(5);
		expect(SCORING_GUIDE_SCORE_CAPS).toHaveLength(4);
		expect(FINDING_SEVERITIES).toEqual(["low", "medium", "high"]);
	});
});

describe("BASE_ISSUE_PENALTIES", () => {
	it("matches the backend scorer's penalty table exactly", () => {
		// Same table is defined in convex/lib/auditScoring.ts; the guide must not drift.
		expect(BASE_ISSUE_PENALTIES).toEqual(AUDIT_FINDING_PENALTIES);
	});
});
