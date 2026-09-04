import { describe, expect, it } from "vitest";

import { getAuditContentTypePolicy } from "@/convex/lib/auditContentTypes";
import { CONTENT_TYPE_SCORING_GUIDE } from "./audit-scoring-guide";
import {
	AUDIT_ISSUE_TYPE_LABELS,
	CONTENT_TYPES,
	CONTENT_TYPE_LABELS,
	CONTENT_TYPE_SCORE_DIMENSION_WEIGHTS,
	SCORE_DIMENSIONS,
	SCORE_DIMENSION_DESCRIPTIONS,
	SCORE_DIMENSION_LABELS,
	VERDICTS,
	VERDICT_LABELS,
} from "./constants";
import type { ContentType, ScoreDimension } from "./types";

describe("derived enum arrays", () => {
	it("mirror the keys of their label maps", () => {
		expect([...CONTENT_TYPES].sort()).toEqual(
			Object.keys(CONTENT_TYPE_LABELS).sort(),
		);
		expect([...VERDICTS].sort()).toEqual(Object.keys(VERDICT_LABELS).sort());
		expect([...SCORE_DIMENSIONS].sort()).toEqual(
			Object.keys(SCORE_DIMENSION_LABELS).sort(),
		);
	});

	it("give every dimension both a label and a description", () => {
		for (const dimension of SCORE_DIMENSIONS) {
			expect(SCORE_DIMENSION_LABELS[dimension]).toBeTruthy();
			expect(SCORE_DIMENSION_DESCRIPTIONS[dimension]).toBeTruthy();
		}
	});

	it("labels every issue type", () => {
		for (const label of Object.values(AUDIT_ISSUE_TYPE_LABELS)) {
			expect(label).toBeTruthy();
		}
		expect(Object.keys(AUDIT_ISSUE_TYPE_LABELS)).toHaveLength(5);
	});
});

describe("CONTENT_TYPE_SCORE_DIMENSION_WEIGHTS", () => {
	it("sums to 100 for every content type", () => {
		for (const contentType of CONTENT_TYPES) {
			const total = Object.values(
				CONTENT_TYPE_SCORE_DIMENSION_WEIGHTS[contentType],
			).reduce((a, b) => a + b, 0);
			expect(total).toBe(100);
		}
	});

	it("covers all five dimensions for every content type", () => {
		for (const contentType of CONTENT_TYPES) {
			expect(Object.keys(CONTENT_TYPE_SCORE_DIMENSION_WEIGHTS[contentType]).sort()).toEqual(
				[...SCORE_DIMENSIONS].sort(),
			);
		}
	});
});

describe("scoring-weight consistency across the three copies", () => {
	// The same per-content-type dimension weights live in three places:
	//  - lib/constants.ts                    (frontend, 0-100 scale)
	//  - lib/audit-scoring-guide.ts          (scoring guide UI, 0-1 scale)
	//  - convex/lib/auditContentTypes.ts     (backend scorer, 0-1 scale)
	// They must stay in lock-step or the displayed rubric drifts from the real score.
	const contentTypes = Object.keys(
		CONTENT_TYPE_SCORE_DIMENSION_WEIGHTS,
	) as ContentType[];
	const dimensions = Object.keys(SCORE_DIMENSION_LABELS) as ScoreDimension[];

	it("frontend constants (÷100) equal the backend scorer weights", () => {
		for (const contentType of contentTypes) {
			const backend = getAuditContentTypePolicy(contentType).scoringWeights;
			for (const dimension of dimensions) {
				expect(
					CONTENT_TYPE_SCORE_DIMENSION_WEIGHTS[contentType][dimension] / 100,
				).toBeCloseTo(backend[dimension], 6);
			}
		}
	});

	it("scoring-guide weights equal the backend scorer weights", () => {
		for (const contentType of contentTypes) {
			const backend = getAuditContentTypePolicy(contentType);
			const guide = CONTENT_TYPE_SCORING_GUIDE[contentType];
			for (const dimension of dimensions) {
				expect(guide.scoringWeights[dimension]).toBeCloseTo(
					backend.scoringWeights[dimension],
					6,
				);
			}
			expect(guide.penaltyMultipliers).toEqual(backend.penaltyMultipliers);
			expect(guide.scoreCaps).toEqual(backend.scoreCaps);
		}
	});
});
