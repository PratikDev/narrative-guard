import { describe, expect, it } from "vitest";

import type { Doc } from "../_generated/dataModel";
import { getAuditContentTypePolicy } from "./auditContentTypes";
import type { AuditIssueType } from "./auditScoring";

const CONTENT_TYPES: Doc<"auditReports">["contentType"][] = [
	"generic",
	"social_post",
	"website_copy",
	"email",
	"press_release",
	"ad_copy",
];

const ISSUE_TYPES: AuditIssueType[] = [
	"mild_style",
	"hype_phrase",
	"banned_phrase",
	"absolute_claim",
	"direct_contradiction",
];

const CAP_KEYS = [
	"oneHypeIssue",
	"oneBannedPhrase",
	"severeIssue",
	"multipleSevereIssues",
] as const;

describe("getAuditContentTypePolicy", () => {
	it("returns a fully-formed policy for every content type", () => {
		for (const contentType of CONTENT_TYPES) {
			const policy = getAuditContentTypePolicy(contentType);
			expect(policy.label).toBeTruthy();
			expect(policy.auditInstructions.length).toBeGreaterThan(0);
		}
	});

	it("has scoring weights that sum to exactly 1 for every content type", () => {
		for (const contentType of CONTENT_TYPES) {
			const { scoringWeights } = getAuditContentTypePolicy(contentType);
			const total = Object.values(scoringWeights).reduce((a, b) => a + b, 0);
			expect(total).toBeCloseTo(1, 6);
		}
	});

	it("defines a penalty multiplier for every issue type", () => {
		for (const contentType of CONTENT_TYPES) {
			const { penaltyMultipliers } = getAuditContentTypePolicy(contentType);
			for (const issueType of ISSUE_TYPES) {
				expect(penaltyMultipliers[issueType]).toBeGreaterThan(0);
			}
		}
	});

	it("defines all four score caps, ordered from lenient to strict", () => {
		for (const contentType of CONTENT_TYPES) {
			const { scoreCaps } = getAuditContentTypePolicy(contentType);
			for (const key of CAP_KEYS) {
				expect(typeof scoreCaps[key]).toBe("number");
			}
			expect(scoreCaps.severeIssue).toBeLessThan(scoreCaps.oneBannedPhrase);
			expect(scoreCaps.multipleSevereIssues).toBeLessThan(scoreCaps.severeIssue);
		}
	});

	it("treats press release and ad copy as the strictest formats for claims", () => {
		const generic = getAuditContentTypePolicy("generic");
		const pressRelease = getAuditContentTypePolicy("press_release");
		const adCopy = getAuditContentTypePolicy("ad_copy");

		expect(pressRelease.penaltyMultipliers.absolute_claim).toBeGreaterThan(
			generic.penaltyMultipliers.absolute_claim,
		);
		expect(adCopy.penaltyMultipliers.banned_phrase).toBeGreaterThan(
			generic.penaltyMultipliers.banned_phrase,
		);
		expect(pressRelease.scoreCaps.oneBannedPhrase).toBeLessThan(
			generic.scoreCaps.oneBannedPhrase,
		);
	});
});
