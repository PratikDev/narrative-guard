import type { ContentType, ScoreDimension, Verdict } from "./types";

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  generic: "Generic text",
  social_post: "Social post",
  website_copy: "Website copy",
  email: "Email",
  press_release: "Press release",
  ad_copy: "Ad copy",
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  on_brand: "On Brand",
  needs_review: "Needs Review",
  off_brand: "Off Brand",
};

export const SCORE_DIMENSION_LABELS: Record<ScoreDimension, string> = {
  toneAlignment: "Tone alignment",
  messagingAlignment: "Messaging alignment",
  bannedPhraseSafety: "Banned phrase safety",
  audienceFit: "Audience fit",
  clarityAndTrust: "Clarity and trust",
};

export const SCORE_DIMENSION_DESCRIPTIONS: Record<ScoreDimension, string> = {
  toneAlignment: "How closely the content matches the brand's voice and tone.",
  messagingAlignment:
    "How well the content supports the brand's positioning and approved messages.",
  bannedPhraseSafety:
    "Whether the content avoids restricted language, risky claims, and off-policy phrasing.",
  audienceFit:
    "How well the content fits the intended reader's context, expectations, and level of detail.",
  clarityAndTrust:
    "How clearly and credibly the content communicates without overstatement.",
};

export const SCORE_DIMENSION_WEIGHTS: Record<ScoreDimension, number> = {
  toneAlignment: 25,
  messagingAlignment: 25,
  bannedPhraseSafety: 25,
  audienceFit: 15,
  clarityAndTrust: 10,
};

export const CONTENT_TYPES = Object.keys(CONTENT_TYPE_LABELS) as ContentType[];

export const VERDICTS = Object.keys(VERDICT_LABELS) as Verdict[];

export const SCORE_DIMENSIONS = Object.keys(
  SCORE_DIMENSION_LABELS
) as ScoreDimension[];
