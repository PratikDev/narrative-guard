import type { Doc, Id } from "@/convex/_generated/dataModel";
import { dimensionScores } from "@/convex/schema";
import { Infer } from "convex/values";

export type Verdict = Doc<"auditReports">["verdict"];

export type ContentType = Doc<"auditReports">["contentType"];

export type AuditStatus = Doc<"auditReports">["status"];

export type AuditIssueType = Doc<"auditFindings">["issueType"];

export type ScoreDimension = keyof Infer<typeof dimensionScores>;

export type DimensionScores = Record<ScoreDimension, number>;

export type FlaggedSentence = {
  id: string;
  sentence: string;
  reason: string;
  evidence?: string;
  severity: Doc<"auditFindings">["severity"];
  issueType: AuditIssueType;
};

export type AuditReport = {
  id: string;
  brandId: string;
  brandName: string;
  brandConstitutionVersionId?: Id<"brandConstitutionVersions"> | null;
  brandConstitutionVersion: {
    id: Id<"brandConstitutionVersions">;
    version: number;
    createdAt: number;
  } | null;
  retryOfReportId?: Doc<"auditReports">["_id"];
  auditor: {
    id: Doc<"users">["_id"];
    name: string | null;
    email: string | null;
  };
  contentType: ContentType;
  originalContent: string;
  score: number;
  verdict: Verdict;
  summary: string;
  dimensionScores: DimensionScores;
  flaggedSentences: FlaggedSentence[];
  rewriteSuggestion: string;
  status: AuditStatus;
  error?: string;
  createdAt: number;
  updatedAt: number;
};

export type DashboardStats = {
  totalReports: number;
  averageScore: number;
  needsReviewCount: number;
  offBrandCount: number;
  onBrandCount: number;
};
