import type { Doc } from "../_generated/dataModel";
import { AUDIT_SCORE_CAPS, AUDIT_SCORE_WEIGHTS } from "./auditScoring";
import type {
  AuditDimensionScores,
  AuditPenaltyMultipliers,
  AuditScoreCaps,
} from "./auditScoring";

type AuditContentType = Doc<"auditReports">["contentType"];

export type AuditContentTypePolicy = {
  label: string;
  auditInstructions: string;
  scoringWeights: AuditDimensionScores;
  penaltyMultipliers: AuditPenaltyMultipliers;
  scoreCaps: AuditScoreCaps;
};

const AUDIT_CONTENT_TYPE_POLICIES: Record<
  AuditContentType,
  AuditContentTypePolicy
> = {
  generic: {
    label: "Generic text",
    auditInstructions:
      "Apply balanced brand standards across tone, approved messaging, restricted language, audience fit, and clarity. Treat the content as general-purpose copy unless the submitted text clearly implies a narrower format.",
    scoringWeights: AUDIT_SCORE_WEIGHTS,
    penaltyMultipliers: {
      mild_style: 1,
      hype_phrase: 1,
      banned_phrase: 1,
      absolute_claim: 1,
      direct_contradiction: 1,
    },
    scoreCaps: AUDIT_SCORE_CAPS,
  },
  social_post: {
    label: "Social post",
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
    label: "Website copy",
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
    label: "Email",
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
    label: "Press release",
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
    label: "Ad copy",
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

function hasValidWeightTotal(weights: AuditDimensionScores) {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  return Math.abs(total - 1) < 0.0001;
}

for (const [contentType, policy] of Object.entries(
  AUDIT_CONTENT_TYPE_POLICIES
)) {
  if (!hasValidWeightTotal(policy.scoringWeights)) {
    throw new Error(`Audit scoring weights must sum to 1 for ${contentType}.`);
  }
}

export function getAuditContentTypePolicy(contentType: AuditContentType) {
  return AUDIT_CONTENT_TYPE_POLICIES[contentType];
}
