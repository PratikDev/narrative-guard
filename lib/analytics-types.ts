import type { Id } from "@/convex/_generated/dataModel";
import type { ContentType, Verdict } from "./types";

export type DateRangePreset = "7d" | "30d" | "90d" | "all";

export type AnalyticsFilters = {
  datePreset: DateRangePreset;
  brandId: Id<"brands"> | "all";
  contentType: ContentType | "all";
  memberId: Id<"users"> | "all";
};

export type DateRange = {
  fromTs: number | undefined;
  toTs: number | undefined;
};

// Convex query args derived from AnalyticsFilters
export type AnalyticsQueryArgs = {
  workspaceId?: Id<"workspaces">;
  fromTs?: number;
  toTs?: number;
  brandId?: Id<"brands">;
  contentType?: ContentType;
  memberId?: Id<"users">;
};

export type AnalyticsSummary = {
  totalAudits: number;
  avgScore: number;
  onBrandCount: number;
  needsReviewCount: number;
  offBrandCount: number;
  totalFindings: number;
  activeBrands: number;
  activeRunners: number;
  prevTotalAudits: number | null;
  prevAvgScore: number | null;
  prevOffBrandCount: number | null;
  prevTotalFindings: number | null;
};

export type ScoreTrendPoint = {
  date: string;
  avgScore: number;
  count: number;
};

export type AuditVolumePoint = {
  date: string;
  count: number;
};

export type VerdictDistributionItem = {
  verdict: Verdict;
  label: string;
  count: number;
};

export type IssueTypeBreakdownItem = {
  issueType: string;
  label: string;
  count: number;
};

export type SeverityBreakdownItem = {
  severity: "low" | "medium" | "high";
  label: string;
  count: number;
};

export type ContentTypePerformanceItem = {
  contentType: ContentType;
  label: string;
  avgScore: number;
  count: number;
};

export type BrandComparisonItem = {
  brandId: string;
  brandName: string;
  avgScore: number;
  auditCount: number;
  offBrandCount: number;
};

export type ScoreDimensionBreakdownItem = {
  dimension: string;
  label: string;
  avgValue: number;
};

export type MemberActivityItem = {
  userId: string;
  name: string | null;
  email: string | null;
  auditCount: number;
  avgScore: number;
  offBrandCount: number;
  lastAuditAt: number | null;
};

export type RiskyAuditRow = {
  reportId: string;
  date: number;
  brandName: string;
  contentType: ContentType;
  score: number;
  verdict: Verdict;
  mainIssueType: string | null;
  findingsCount: number;
  auditorName: string | null;
  auditorEmail: string | null;
};
