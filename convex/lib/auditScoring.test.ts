import { describe, expect, it } from "vitest";

import { getAuditContentTypePolicy } from "./auditContentTypes";
import {
	AUDIT_FINDING_PENALTIES,
	AUDIT_SCORE_CAPS,
	AUDIT_SCORE_FLOORS,
	AUDIT_SCORE_WEIGHTS,
	calculateFinalAuditScore,
	clampScore,
	verdictFromScore,
	type AuditDimensionScores,
	type AuditFindingForScoring,
	type AuditIssueType,
	type AuditPenaltyMultipliers,
	type AuditScoreCaps,
} from "./auditScoring";

const ALL_ISSUE_TYPES: AuditIssueType[] = [
	"mild_style",
	"hype_phrase",
	"banned_phrase",
	"absolute_claim",
	"direct_contradiction",
];
const ALL_SEVERITIES = ["low", "medium", "high"] as const;

const NO_MULTIPLIERS: AuditPenaltyMultipliers = {
	mild_style: 1,
	hype_phrase: 1,
	banned_phrase: 1,
	absolute_claim: 1,
	direct_contradiction: 1,
};

function flatDims(value: number): AuditDimensionScores {
	return {
		toneAlignment: value,
		messagingAlignment: value,
		bannedPhraseSafety: value,
		audienceFit: value,
		clarityAndTrust: value,
	};
}

function score(opts: {
	dims: number | AuditDimensionScores;
	findings?: AuditFindingForScoring[];
	weights?: AuditDimensionScores;
	multipliers?: AuditPenaltyMultipliers;
	caps?: AuditScoreCaps;
}) {
	return calculateFinalAuditScore({
		dimensions: typeof opts.dims === "number" ? flatDims(opts.dims) : opts.dims,
		findings: opts.findings ?? [],
		scoringWeights: opts.weights ?? AUDIT_SCORE_WEIGHTS,
		penaltyMultipliers: opts.multipliers ?? NO_MULTIPLIERS,
		scoreCaps: opts.caps ?? AUDIT_SCORE_CAPS,
	});
}

const finding = (
	issueType: AuditIssueType,
	severity: AuditFindingForScoring["severity"],
): AuditFindingForScoring => ({ issueType, severity });

describe("clampScore", () => {
	it("rounds to the nearest integer", () => {
		expect(clampScore(50.4)).toBe(50);
		expect(clampScore(50.5)).toBe(51);
		expect(clampScore(2.5)).toBe(3);
	});

	it("clamps into the 0-100 range", () => {
		expect(clampScore(-10)).toBe(0);
		expect(clampScore(-0.4)).toBe(0);
		expect(clampScore(150)).toBe(100);
		expect(clampScore(99.9)).toBe(100);
	});
});

describe("verdictFromScore", () => {
	it("maps scores to verdict bands at the 85 / 65 thresholds", () => {
		expect(verdictFromScore(100)).toBe("on_brand");
		expect(verdictFromScore(85)).toBe("on_brand");
		expect(verdictFromScore(84)).toBe("needs_review");
		expect(verdictFromScore(65)).toBe("needs_review");
		expect(verdictFromScore(64)).toBe("off_brand");
		expect(verdictFromScore(0)).toBe("off_brand");
	});
});

describe("scoring tables", () => {
	it("weights sum to 1", () => {
		const total = Object.values(AUDIT_SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
		expect(total).toBeCloseTo(1, 10);
	});

	it("penalties are non-decreasing with severity for every issue type", () => {
		for (const issueType of ALL_ISSUE_TYPES) {
			const row = AUDIT_FINDING_PENALTIES[issueType];
			expect(row.low).toBeLessThanOrEqual(row.medium);
			expect(row.medium).toBeLessThanOrEqual(row.high);
		}
	});

	it("severe issue types are penalised at least as hard as non-severe ones", () => {
		expect(AUDIT_FINDING_PENALTIES.absolute_claim.low).toBeGreaterThan(
			AUDIT_FINDING_PENALTIES.banned_phrase.low,
		);
		expect(AUDIT_FINDING_PENALTIES.direct_contradiction.high).toBeGreaterThan(
			AUDIT_FINDING_PENALTIES.hype_phrase.high,
		);
	});
});

describe("calculateFinalAuditScore - base score", () => {
	it("is the weight-dot-product of the dimension scores when there are no findings", () => {
		expect(score({ dims: 80 })).toBe(80);
		expect(
			score({
				dims: {
					toneAlignment: 90,
					messagingAlignment: 80,
					bannedPhraseSafety: 70,
					audienceFit: 60,
					clarityAndTrust: 50,
				},
			}),
			// 90*.25 + 80*.25 + 70*.25 + 60*.15 + 50*.10 = 74
		).toBe(74);
	});

	it("only counts a dimension in proportion to its weight", () => {
		// tone alignment carries 0.25 of the score; everything else is 0.
		expect(
			score({
				dims: {
					toneAlignment: 100,
					messagingAlignment: 0,
					bannedPhraseSafety: 0,
					audienceFit: 0,
					clarityAndTrust: 0,
				},
			}),
		).toBe(25);
	});
});

describe("calculateFinalAuditScore - penalties", () => {
	it("subtracts penalty[issueType][severity] * multiplier per finding", () => {
		// base 80, one mild_style/medium (penalty 5, multiplier 1) -> 75
		expect(score({ dims: 80, findings: [finding("mild_style", "medium")] })).toBe(
			75,
		);
		// base 80, mild_style/high (7) + mild_style/low (3) -> 70
		expect(
			score({
				dims: 80,
				findings: [finding("mild_style", "high"), finding("mild_style", "low")],
			}),
		).toBe(70);
	});

	it("carries a fractional penalty through to a single final rounding step", () => {
		// website_copy mild_style multiplier is 0.9 -> penalty 5 * 0.9 = 4.5
		// base 40 (below the floor threshold, so no floor), 40 - 4.5 = 35.5 -> round -> 36
		const websiteCopy = getAuditContentTypePolicy("website_copy");
		expect(
			score({
				dims: 40,
				findings: [finding("mild_style", "medium")],
				weights: websiteCopy.scoringWeights,
				multipliers: websiteCopy.penaltyMultipliers,
				caps: websiteCopy.scoreCaps,
			}),
		).toBe(36);
	});

	it("accepts every issue-type / severity combination without throwing", () => {
		for (const issueType of ALL_ISSUE_TYPES) {
			for (const severity of ALL_SEVERITIES) {
				expect(() =>
					score({ dims: 90, findings: [finding(issueType, severity)] }),
				).not.toThrow();
			}
		}
	});
});

describe("calculateFinalAuditScore - caps", () => {
	it("caps a single hype-phrase finding at the oneHypeIssue cap", () => {
		// base 100, hype_phrase/low penalty 8 -> 92, capped to 84
		expect(score({ dims: 100, findings: [finding("hype_phrase", "low")] })).toBe(
			AUDIT_SCORE_CAPS.oneHypeIssue,
		);
	});

	it("caps a single banned-phrase finding at the oneBannedPhrase cap", () => {
		// base 100, banned_phrase/low penalty 15 -> 85, capped to 84
		expect(
			score({ dims: 100, findings: [finding("banned_phrase", "low")] }),
		).toBe(AUDIT_SCORE_CAPS.oneBannedPhrase);
	});

	it("does not apply the single-finding caps when there is more than one finding", () => {
		// two hype_phrase/low: base 100, penalty 16 -> 84; the oneHypeIssue branch
		// requires exactly one finding, so this is the raw 84 rather than a cap.
		expect(
			score({
				dims: 100,
				findings: [finding("hype_phrase", "low"), finding("hype_phrase", "low")],
			}),
		).toBe(84);
	});

	it("caps one severe finding at the severeIssue cap", () => {
		// base 100, absolute_claim/low penalty 25 -> 75, capped to 64
		expect(
			score({ dims: 100, findings: [finding("absolute_claim", "low")] }),
		).toBe(AUDIT_SCORE_CAPS.severeIssue);
	});

	it("caps two or more severe findings at the multipleSevereIssues cap", () => {
		// base 100, 25 + 25 -> 50, capped to 44
		expect(
			score({
				dims: 100,
				findings: [
					finding("absolute_claim", "low"),
					finding("direct_contradiction", "low"),
				],
			}),
		).toBe(AUDIT_SCORE_CAPS.multipleSevereIssues);
	});

	it("leaves the score untouched when it is already below the cap", () => {
		// base 100, absolute_claim/high penalty 40 -> 60, which is under the 64 cap
		expect(
			score({ dims: 100, findings: [finding("absolute_claim", "high")] }),
		).toBe(60);
	});

	it("prioritises the severe cap over the single-finding hype/banned caps", () => {
		// hype + severe: severe branch wins, capped at severeIssue (64)
		// base 90, penalty 15 + 32 = 47 -> 43 (already below 64)
		expect(
			score({
				dims: 90,
				findings: [
					finding("hype_phrase", "high"),
					finding("absolute_claim", "medium"),
				],
			}),
		).toBe(43);
	});
});

describe("calculateFinalAuditScore - isolated non-severe floor", () => {
	it("floors at 65 when 1-2 non-severe findings drag an otherwise healthy score down", () => {
		// base 60, two mild_style/high (7 each) -> 46, floored to 65
		expect(
			score({
				dims: 60,
				findings: [finding("mild_style", "high"), finding("mild_style", "high")],
			}),
		).toBe(AUDIT_SCORE_FLOORS.isolatedNonSevereIssues);
	});

	it("does not floor when there are more than two findings", () => {
		// base 60, three mild_style/high -> 39, no floor
		expect(
			score({
				dims: 60,
				findings: [
					finding("mild_style", "high"),
					finding("mild_style", "high"),
					finding("mild_style", "high"),
				],
			}),
		).toBe(39);
	});

	it("does not floor when the base score is below 50", () => {
		// base 40, two mild_style/low (3 each) -> 34, no floor
		expect(
			score({
				dims: 40,
				findings: [finding("mild_style", "low"), finding("mild_style", "low")],
			}),
		).toBe(34);
	});

	it("does not floor when a severe finding is present", () => {
		// base 100, absolute_claim/low -> capped to 64 (never raised back to 65)
		expect(
			score({ dims: 100, findings: [finding("absolute_claim", "low")] }),
		).toBe(64);
	});

	it("does not floor a clean audit with zero findings", () => {
		expect(score({ dims: 40 })).toBe(40);
	});
});

describe("calculateFinalAuditScore - content-type policies", () => {
	it("reproduces the published Worked Example (ad copy, high absolute claim)", () => {
		// docs / components/scoring/WorkedScoringExample.tsx:
		// dimension blend 82, ad_copy absolute_claim multiplier 1.45, base penalty 40
		// -> penalty 58 -> 82 - 58 = 24, off_brand
		const adCopy = getAuditContentTypePolicy("ad_copy");
		const result = score({
			dims: 82,
			findings: [finding("absolute_claim", "high")],
			weights: adCopy.scoringWeights,
			multipliers: adCopy.penaltyMultipliers,
			caps: adCopy.scoreCaps,
		});
		expect(result).toBe(24);
		expect(verdictFromScore(result)).toBe("off_brand");
	});

	it("applies the stricter press-release hype cap", () => {
		// press_release hype_phrase multiplier 1.25 -> penalty 15 * 1.25 = 18.75
		// base 100 -> 81.25, capped to press_release.oneHypeIssue (76)
		const pressRelease = getAuditContentTypePolicy("press_release");
		expect(
			score({
				dims: 100,
				findings: [finding("hype_phrase", "high")],
				weights: pressRelease.scoringWeights,
				multipliers: pressRelease.penaltyMultipliers,
				caps: pressRelease.scoreCaps,
			}),
		).toBe(76);
	});

	it("applies the more forgiving social-post hype multiplier", () => {
		// social_post hype_phrase multiplier 0.9 -> penalty 12 * 0.9 = 10.8
		// base 90 -> 79.2 -> round -> 79 (under the 86 cap, over the 65 floor)
		const social = getAuditContentTypePolicy("social_post");
		expect(
			score({
				dims: 90,
				findings: [finding("hype_phrase", "medium")],
				weights: social.scoringWeights,
				multipliers: social.penaltyMultipliers,
				caps: social.scoreCaps,
			}),
		).toBe(79);
	});
});

describe("calculateFinalAuditScore - invariants", () => {
	it("always returns an integer within 0-100", () => {
		const dimValues = [0, 17, 50, 73, 100];
		const findingSets: AuditFindingForScoring[][] = [
			[],
			[finding("mild_style", "low")],
			[finding("hype_phrase", "medium")],
			[finding("banned_phrase", "high")],
			[finding("absolute_claim", "high")],
			[
				finding("absolute_claim", "high"),
				finding("direct_contradiction", "high"),
				finding("banned_phrase", "high"),
			],
		];

		for (const dims of dimValues) {
			for (const findings of findingSets) {
				const result = score({ dims, findings });
				expect(Number.isInteger(result)).toBe(true);
				expect(result).toBeGreaterThanOrEqual(0);
				expect(result).toBeLessThanOrEqual(100);
			}
		}
	});
});
