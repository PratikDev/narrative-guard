import type { Doc } from "../_generated/dataModel";

export type AuditIssueType =
  | "mild_style"
  | "hype_phrase"
  | "banned_phrase"
  | "absolute_claim"
  | "direct_contradiction";

export type AuditFindingForScoring = {
  issueType: AuditIssueType;
  severity: Doc<"auditFindings">["severity"];
};

export type AuditDimensionScores = {
  toneAlignment: number;
  messagingAlignment: number;
  bannedPhraseSafety: number;
  audienceFit: number;
  clarityAndTrust: number;
};

export const AUDIT_SCORE_WEIGHTS: AuditDimensionScores = {
  toneAlignment: 0.25,
  messagingAlignment: 0.25,
  bannedPhraseSafety: 0.25,
  audienceFit: 0.15,
  clarityAndTrust: 0.1,
};

export const AUDIT_FINDING_PENALTIES: Record<
  AuditIssueType,
  Record<Doc<"auditFindings">["severity"], number>
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

export const AUDIT_SCORE_CAPS = {
  oneHypeIssue: 84,
  oneBannedPhrase: 84,
  severeIssue: 64,
  multipleSevereIssues: 44,
};

export const AUDIT_SCORE_FLOORS = {
  isolatedNonSevereIssues: 65,
};

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateFinalAuditScore(args: {
  dimensions: AuditDimensionScores;
  findings: AuditFindingForScoring[];
}) {
  const baseScore = Object.entries(AUDIT_SCORE_WEIGHTS).reduce(
    (total, [dimension, weight]) =>
      total + args.dimensions[dimension as keyof AuditDimensionScores] * weight,
    0
  );

  const penalty = args.findings.reduce(
    (total, finding) =>
      total + AUDIT_FINDING_PENALTIES[finding.issueType][finding.severity],
    0
  );

  let score = baseScore - penalty;
  const severeFindings = args.findings.filter(
    (finding) =>
      finding.issueType === "absolute_claim" ||
      finding.issueType === "direct_contradiction"
  );
  const hasOnlyNonSevereFindings =
    args.findings.length > 0 && severeFindings.length === 0;

  if (severeFindings.length >= 2) {
    score = Math.min(score, AUDIT_SCORE_CAPS.multipleSevereIssues);
  } else if (severeFindings.length === 1) {
    score = Math.min(score, AUDIT_SCORE_CAPS.severeIssue);
  } else if (
    args.findings.length === 1 &&
    args.findings[0]?.issueType === "banned_phrase"
  ) {
    score = Math.min(score, AUDIT_SCORE_CAPS.oneBannedPhrase);
  } else if (
    args.findings.length === 1 &&
    args.findings[0]?.issueType === "hype_phrase"
  ) {
    score = Math.min(score, AUDIT_SCORE_CAPS.oneHypeIssue);
  }

  if (
    hasOnlyNonSevereFindings &&
    args.findings.length <= 2 &&
    baseScore >= 50
  ) {
    score = Math.max(score, AUDIT_SCORE_FLOORS.isolatedNonSevereIssues);
  }

  return clampScore(score);
}

export function verdictFromScore(
  score: number
): Doc<"auditReports">["verdict"] {
  if (score >= 85) return "on_brand";
  if (score >= 65) return "needs_review";

  return "off_brand";
}
