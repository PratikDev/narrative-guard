import type { Doc } from "@/convex/_generated/dataModel";
import { dimensionScores } from "@/convex/schema";
import { Infer } from "convex/values";

export type Verdict = Doc<"auditReports">["verdict"];

export type ContentType = Doc<"auditReports">["contentType"];

export type AuditStatus = Doc<"auditReports">["status"];

export type ScoreDimension = keyof Infer<typeof dimensionScores>;

export type DimensionScores = Record<ScoreDimension, number>;

export type FlaggedSentence = {
  id: string;
  sentence: string;
  reason: string;
  severity: Doc<"auditFindings">["severity"];
};

export type AuditReport = {
  id: string;
  brandId: string;
  brandName: string;
  contentType: ContentType;
  originalContent: string;
  score: number;
  verdict: Verdict;
  summary: string;
  dimensionScores: DimensionScores;
  flaggedSentences: FlaggedSentence[];
  rewriteSuggestion: string;
  status: AuditStatus;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  totalReports: number;
  averageScore: number;
  needsReviewCount: number;
  offBrandCount: number;
  onBrandCount: number;
};
