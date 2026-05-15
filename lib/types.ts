export type Id = string;

export type Verdict = "on_brand" | "needs_review" | "off_brand";

export type ContentType =
  | "generic"
  | "social_post"
  | "website_copy"
  | "email"
  | "press_release"
  | "ad_copy";

export type AuditStatus = "idle" | "processing" | "complete" | "failed";

export type ScoreDimension =
  | "toneAlignment"
  | "messagingAlignment"
  | "bannedPhraseSafety"
  | "audienceFit"
  | "clarityAndTrust";

export type Brand = {
  id: Id;
  name: string;
  constitution: string;
  createdAt: string;
  updatedAt: string;
};

export type DimensionScores = Record<ScoreDimension, number>;

export type FlaggedSentence = {
  id: Id;
  sentence: string;
  reason: string;
  severity: "low" | "medium" | "high";
};

export type AuditReport = {
  id: Id;
  brandId: Id;
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

export type BrandFormValues = {
  name: string;
  constitution: string;
};

export type AuditFormValues = {
  brandId: Id;
  contentType: ContentType;
  content: string;
};
