import {
	AUDIT_ISSUE_TYPE_LABELS,
	CONTENT_TYPE_LABELS,
	SCORE_DIMENSION_DESCRIPTIONS,
	SCORE_DIMENSION_LABELS,
} from "@/lib/constants";
import type { AuditIssueType, ContentType, ScoreDimension } from "@/lib/types";

export type FindingSeverity = "low" | "medium" | "high";

export type ScoreCapKey =
	| "oneHypeIssue"
	| "oneBannedPhrase"
	| "severeIssue"
	| "multipleSevereIssues";

export type AuditScoringGuidePolicy = {
	label: string;
	auditInstructions: string;
	scoringWeights: Record<ScoreDimension, number>;
	penaltyMultipliers: Record<AuditIssueType, number>;
	scoreCaps: Record<ScoreCapKey, number>;
};

export const SCORE_DIMENSION_GUIDE = {
	labels: SCORE_DIMENSION_LABELS,
	descriptions: SCORE_DIMENSION_DESCRIPTIONS,
};

export const ISSUE_TYPE_LABELS = AUDIT_ISSUE_TYPE_LABELS;

export const ISSUE_TYPE_DESCRIPTIONS: Record<
	AuditIssueType,
	{
		meaning: string;
		whyItMatters: string;
		usuallyTriggeredBy: string;
	}
> = {
	mild_style: {
		meaning:
			"The wording is close, but the voice or style does not fully match the brand.",
		whyItMatters:
			"Small style mismatches can make otherwise accurate content feel inconsistent.",
		usuallyTriggeredBy:
			"Overly formal language, casual phrasing, awkward rhythm, or wording that does not fit the brand voice.",
	},
	hype_phrase: {
		meaning:
			"The content uses promotional or exaggerated language that may feel overstated.",
		whyItMatters:
			"Hype can reduce trust, especially in formats where readers expect clear proof.",
		usuallyTriggeredBy:
			"Phrases like breakthrough, revolutionary, best-in-class, game-changing, or similar unsupported claims.",
	},
	banned_phrase: {
		meaning:
			"The content uses language the brand has restricted or marked as risky.",
		whyItMatters:
			"Restricted wording can create compliance, positioning, or trust problems.",
		usuallyTriggeredBy:
			"Known banned phrases, risky claims, off-policy terminology, or language the brand explicitly avoids.",
	},
	absolute_claim: {
		meaning:
			"The content makes a claim that sounds certain, universal, or guaranteed.",
		whyItMatters:
			"Absolute claims are high risk because they often need strong proof and may overpromise.",
		usuallyTriggeredBy:
			"Words like always, never, guaranteed, eliminates, proven for everyone, or claims with no room for context.",
	},
	direct_contradiction: {
		meaning:
			"The content conflicts with approved brand messaging or stated brand rules.",
		whyItMatters:
			"Contradictions can mislead readers and weaken the brand's public position.",
		usuallyTriggeredBy:
			"Statements that oppose approved positioning, claim unsupported capabilities, or say something the brand guidance rejects.",
	},
};

export const BASE_ISSUE_PENALTIES: Record<
	AuditIssueType,
	Record<FindingSeverity, number>
> = {
	mild_style: {
		low: 3,
		medium: 5,
		high: 7,
	},
	hype_phrase: {
		low: 8,
		medium: 12,
		high: 15,
	},
	banned_phrase: {
		low: 15,
		medium: 20,
		high: 25,
	},
	absolute_claim: {
		low: 25,
		medium: 32,
		high: 40,
	},
	direct_contradiction: {
		low: 25,
		medium: 35,
		high: 45,
	},
};

export const SCORE_CAP_LABELS: Record<ScoreCapKey, string> = {
	oneHypeIssue: "One hype issue",
	oneBannedPhrase: "One banned phrase",
	severeIssue: "One severe issue",
	multipleSevereIssues: "Multiple severe issues",
};

export const SCORE_FLOORS = {
	isolatedNonSevereIssues: 65,
};

export const CONTENT_TYPE_SCORING_GUIDE: Record<
	ContentType,
	AuditScoringGuidePolicy
> = {
	generic: {
		label: CONTENT_TYPE_LABELS.generic,
		auditInstructions:
			"Apply balanced brand standards across tone, approved messaging, restricted language, audience fit, and clarity. Treat the content as general-purpose copy unless the submitted text clearly implies a narrower format.",
		scoringWeights: {
			toneAlignment: 0.25,
			messagingAlignment: 0.25,
			bannedPhraseSafety: 0.25,
			audienceFit: 0.15,
			clarityAndTrust: 0.1,
		},
		penaltyMultipliers: {
			mild_style: 1,
			hype_phrase: 1,
			banned_phrase: 1,
			absolute_claim: 1,
			direct_contradiction: 1,
		},
		scoreCaps: {
			oneHypeIssue: 84,
			oneBannedPhrase: 84,
			severeIssue: 64,
			multipleSevereIssues: 44,
		},
	},
	social_post: {
		label: CONTENT_TYPE_LABELS.social_post,
		auditInstructions:
			"Evaluate for brand voice, audience fit, concision, social-native phrasing, and whether the copy feels natural in a feed. Prefer direct, human, platform-appropriate wording over formal corporate language.",
		scoringWeights: {
			toneAlignment: 0.3,
			messagingAlignment: 0.2,
			bannedPhraseSafety: 0.2,
			audienceFit: 0.2,
			clarityAndTrust: 0.1,
		},
		penaltyMultipliers: {
			mild_style: 1.2,
			hype_phrase: 0.9,
			banned_phrase: 1,
			absolute_claim: 1,
			direct_contradiction: 1,
		},
		scoreCaps: {
			oneHypeIssue: 86,
			oneBannedPhrase: 82,
			severeIssue: 62,
			multipleSevereIssues: 42,
		},
	},
	website_copy: {
		label: CONTENT_TYPE_LABELS.website_copy,
		auditInstructions:
			"Evaluate for positioning alignment, clarity, trust, conversion claims, and whether the copy can stand as durable public-facing site language. Pay close attention to unsupported value propositions or claims that could erode credibility.",
		scoringWeights: {
			toneAlignment: 0.2,
			messagingAlignment: 0.3,
			bannedPhraseSafety: 0.2,
			audienceFit: 0.15,
			clarityAndTrust: 0.15,
		},
		penaltyMultipliers: {
			mild_style: 0.9,
			hype_phrase: 1.1,
			banned_phrase: 1,
			absolute_claim: 1.15,
			direct_contradiction: 1.1,
		},
		scoreCaps: {
			oneHypeIssue: 80,
			oneBannedPhrase: 82,
			severeIssue: 60,
			multipleSevereIssues: 40,
		},
	},
	email: {
		label: CONTENT_TYPE_LABELS.email,
		auditInstructions:
			"Evaluate for directness, relationship with the reader, CTA clarity, tone, and whether the message respects the reader's context. Penalize vague asks, mismatched familiarity, or confusing next steps.",
		scoringWeights: {
			toneAlignment: 0.25,
			messagingAlignment: 0.2,
			bannedPhraseSafety: 0.2,
			audienceFit: 0.2,
			clarityAndTrust: 0.15,
		},
		penaltyMultipliers: {
			mild_style: 1,
			hype_phrase: 1,
			banned_phrase: 1,
			absolute_claim: 1.1,
			direct_contradiction: 1,
		},
		scoreCaps: {
			oneHypeIssue: 84,
			oneBannedPhrase: 82,
			severeIssue: 62,
			multipleSevereIssues: 42,
		},
	},
	press_release: {
		label: CONTENT_TYPE_LABELS.press_release,
		auditInstructions:
			"Evaluate for factuality, credibility, formal tone, attribution, and unsupported claims. Treat exaggerated, vague, or certainty-based language as higher risk because this format represents the brand in a public news context.",
		scoringWeights: {
			toneAlignment: 0.15,
			messagingAlignment: 0.2,
			bannedPhraseSafety: 0.3,
			audienceFit: 0.1,
			clarityAndTrust: 0.25,
		},
		penaltyMultipliers: {
			mild_style: 0.8,
			hype_phrase: 1.25,
			banned_phrase: 1.25,
			absolute_claim: 1.5,
			direct_contradiction: 1.35,
		},
		scoreCaps: {
			oneHypeIssue: 76,
			oneBannedPhrase: 72,
			severeIssue: 52,
			multipleSevereIssues: 34,
		},
	},
	ad_copy: {
		label: CONTENT_TYPE_LABELS.ad_copy,
		auditInstructions:
			"Evaluate for claim safety, brevity, urgency, compliance risk, and clarity. Scrutinize exaggerated benefits, pressure tactics, absolute claims, and unclear offers more heavily than in general copy.",
		scoringWeights: {
			toneAlignment: 0.15,
			messagingAlignment: 0.2,
			bannedPhraseSafety: 0.35,
			audienceFit: 0.1,
			clarityAndTrust: 0.2,
		},
		penaltyMultipliers: {
			mild_style: 0.8,
			hype_phrase: 1.25,
			banned_phrase: 1.4,
			absolute_claim: 1.45,
			direct_contradiction: 1.2,
		},
		scoreCaps: {
			oneHypeIssue: 78,
			oneBannedPhrase: 70,
			severeIssue: 54,
			multipleSevereIssues: 36,
		},
	},
};

export const SCORING_GUIDE_CONTENT_TYPES = Object.keys(
	CONTENT_TYPE_SCORING_GUIDE,
) as ContentType[];

export const SCORING_GUIDE_ISSUE_TYPES = Object.keys(
	ISSUE_TYPE_LABELS,
) as AuditIssueType[];

export const SCORING_GUIDE_SCORE_CAPS = Object.keys(
	SCORE_CAP_LABELS,
) as ScoreCapKey[];

export const FINDING_SEVERITIES: FindingSeverity[] = ["low", "medium", "high"];

export function formatWeightPercent(weight: number) {
	return `${Math.round(weight * 100)}%`;
}

export function getStrictnessLabel(multiplier: number) {
	if (multiplier < 1) return "More forgiving";
	if (multiplier === 1) return "Standard";
	if (multiplier < 1.25) return "Stricter";

	return "Much stricter";
}
