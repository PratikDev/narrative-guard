import type { AuditReport, Brand, DashboardStats } from "./types";

export const mockBrands: Brand[] = [
  {
    id: "brand-northstar",
    name: "Northstar Capital",
    constitution:
      "Use a measured, confident, plain-spoken voice. Lead with evidence and operational clarity. Avoid hype, guarantees, casual slang, and fear-based language. Preferred phrases include disciplined growth, resilient portfolio, long-term confidence, and practical guidance. Audience: founders, CFOs, and private market operators.",
    createdAt: "2026-03-05T09:00:00Z",
    updatedAt: "2026-05-01T10:30:00Z",
  },
  {
    id: "brand-evergreen",
    name: "Evergreen Studio",
    constitution:
      "Sound warm, useful, and design-literate without sounding precious. Explain outcomes before aesthetics. Avoid jargon, insider design references, and claims that feel exclusive. Audience: independent retailers, hospitality teams, and service businesses.",
    createdAt: "2026-02-14T13:00:00Z",
    updatedAt: "2026-04-27T15:20:00Z",
  },
  {
    id: "brand-clinica",
    name: "Clinica One",
    constitution:
      "Use clear, reassuring, clinically responsible language. Never overpromise outcomes or imply urgent risk without context. Prefer accessible explanations, privacy-forward wording, and patient agency. Audience: patients, caregivers, and employer benefits teams.",
    createdAt: "2026-01-22T11:20:00Z",
    updatedAt: "2026-05-03T08:45:00Z",
  },
];

export const mockReports: AuditReport[] = [
  {
    id: "report-1006",
    brandId: "brand-northstar",
    brandName: "Northstar Capital",
    contentType: "press_release",
    originalContent:
      "Northstar Capital today announced its new operator support program for portfolio finance teams. The program gives leaders a practical path to tighter reporting, calmer planning cycles, and more durable growth decisions.",
    score: 91,
    verdict: "on_brand",
    summary:
      "The copy is calm, evidence-led, and aligned with Northstar's operating partner tone.",
    dimensionScores: {
      toneAlignment: 94,
      messagingAlignment: 90,
      bannedPhraseSafety: 96,
      audienceFit: 88,
      clarityAndTrust: 89,
    },
    flaggedSentences: [],
    rewriteSuggestion:
      "Northstar Capital announced an operator support program for portfolio finance teams, giving leaders a practical path to tighter reporting, calmer planning cycles, and more durable growth decisions.",
    status: "complete",
    createdAt: "2026-05-09T14:10:00Z",
    updatedAt: "2026-05-09T14:10:00Z",
  },
  {
    id: "report-1005",
    brandId: "brand-clinica",
    brandName: "Clinica One",
    contentType: "website_copy",
    originalContent:
      "Get answers instantly and never worry about confusing care options again. Clinica One gives every employee the perfect next step in minutes.",
    score: 58,
    verdict: "off_brand",
    summary:
      "The copy overpromises certainty and speed in a healthcare context, reducing clinical trust.",
    dimensionScores: {
      toneAlignment: 55,
      messagingAlignment: 62,
      bannedPhraseSafety: 48,
      audienceFit: 64,
      clarityAndTrust: 59,
    },
    flaggedSentences: [
      {
        id: "flag-1005-1",
        sentence:
          "Get answers instantly and never worry about confusing care options again.",
        reason:
          "Absolute timing and emotional guarantee conflict with the brand's clinically responsible language.",
        severity: "high",
      },
      {
        id: "flag-1005-2",
        sentence:
          "Clinica One gives every employee the perfect next step in minutes.",
        reason:
          "The phrase 'perfect next step' overstates certainty for healthcare navigation.",
        severity: "high",
      },
    ],
    rewriteSuggestion:
      "Clinica One helps employees understand care options more clearly, with guided next steps that support informed decisions.",
    status: "complete",
    createdAt: "2026-05-08T10:05:00Z",
    updatedAt: "2026-05-08T10:05:00Z",
  },
  {
    id: "report-1004",
    brandId: "brand-evergreen",
    brandName: "Evergreen Studio",
    contentType: "social_post",
    originalContent:
      "Your storefront deserves a glow-up. We build interiors that help local customers understand what you sell, why it matters, and where to go next.",
    score: 76,
    verdict: "needs_review",
    summary:
      "The customer benefit is clear, but the opening phrase is more casual than Evergreen's usual voice.",
    dimensionScores: {
      toneAlignment: 70,
      messagingAlignment: 82,
      bannedPhraseSafety: 91,
      audienceFit: 74,
      clarityAndTrust: 77,
    },
    flaggedSentences: [
      {
        id: "flag-1004-1",
        sentence: "Your storefront deserves a glow-up.",
        reason:
          "The phrase is casual and consumer-styled compared with the brand's useful, design-literate tone.",
        severity: "medium",
      },
    ],
    rewriteSuggestion:
      "Your storefront should make the next step clear. We design interiors that help local customers understand what you sell, why it matters, and where to go next.",
    status: "complete",
    createdAt: "2026-05-06T16:40:00Z",
    updatedAt: "2026-05-06T16:40:00Z",
  },
  {
    id: "report-1003",
    brandId: "brand-northstar",
    brandName: "Northstar Capital",
    contentType: "email",
    originalContent:
      "This is a huge opportunity to unlock explosive portfolio growth. Our team can transform your reporting process and eliminate uncertainty this quarter.",
    score: 63,
    verdict: "off_brand",
    summary:
      "The message uses hype and certainty claims that conflict with Northstar's disciplined tone.",
    dimensionScores: {
      toneAlignment: 52,
      messagingAlignment: 68,
      bannedPhraseSafety: 56,
      audienceFit: 70,
      clarityAndTrust: 61,
    },
    flaggedSentences: [
      {
        id: "flag-1003-1",
        sentence: "This is a huge opportunity to unlock explosive portfolio growth.",
        reason:
          "Hype-driven growth language is outside the brand's measured financial voice.",
        severity: "high",
      },
      {
        id: "flag-1003-2",
        sentence:
          "Our team can transform your reporting process and eliminate uncertainty this quarter.",
        reason:
          "The sentence promises total uncertainty reduction, which weakens credibility.",
        severity: "medium",
      },
    ],
    rewriteSuggestion:
      "This is an opportunity to strengthen portfolio reporting and improve planning discipline this quarter. Our team can help finance leaders identify gaps, clarify operating rhythms, and make decisions with better context.",
    status: "complete",
    createdAt: "2026-04-30T12:15:00Z",
    updatedAt: "2026-04-30T12:15:00Z",
  },
  {
    id: "report-1002",
    brandId: "brand-clinica",
    brandName: "Clinica One",
    contentType: "ad_copy",
    originalContent:
      "Healthcare guidance that meets people where they are, with clear options and privacy-first support from the first question.",
    score: 88,
    verdict: "on_brand",
    summary:
      "The copy is reassuring, accessible, and privacy-forward without overpromising outcomes.",
    dimensionScores: {
      toneAlignment: 90,
      messagingAlignment: 86,
      bannedPhraseSafety: 93,
      audienceFit: 87,
      clarityAndTrust: 85,
    },
    flaggedSentences: [],
    rewriteSuggestion:
      "Healthcare guidance that meets people where they are, with clear options and privacy-first support from the first question.",
    status: "complete",
    createdAt: "2026-04-24T09:35:00Z",
    updatedAt: "2026-04-24T09:35:00Z",
  },
  {
    id: "report-1001",
    brandId: "brand-evergreen",
    brandName: "Evergreen Studio",
    contentType: "generic",
    originalContent:
      "We turn beautiful ideas into practical rooms for shops, cafes, and studios that need customers to feel oriented quickly.",
    score: 82,
    verdict: "needs_review",
    summary:
      "The piece is mostly aligned, with a small opportunity to lead more directly with business outcomes.",
    dimensionScores: {
      toneAlignment: 84,
      messagingAlignment: 78,
      bannedPhraseSafety: 94,
      audienceFit: 80,
      clarityAndTrust: 76,
    },
    flaggedSentences: [
      {
        id: "flag-1001-1",
        sentence: "We turn beautiful ideas into practical rooms for shops, cafes, and studios that need customers to feel oriented quickly.",
        reason:
          "The business outcome is present but could be clearer before the aesthetic reference.",
        severity: "low",
      },
    ],
    rewriteSuggestion:
      "We design practical rooms for shops, cafes, and studios, helping customers feel oriented quickly while keeping each space warm and distinctive.",
    status: "complete",
    createdAt: "2026-04-17T13:25:00Z",
    updatedAt: "2026-04-17T13:25:00Z",
  },
];

export const dashboardStats: DashboardStats = {
  totalReports: mockReports.length,
  averageScore: Math.round(
    mockReports.reduce((total, report) => total + report.score, 0) /
      mockReports.length
  ),
  needsReviewCount: mockReports.filter(
    (report) => report.verdict === "needs_review"
  ).length,
  offBrandCount: mockReports.filter((report) => report.verdict === "off_brand")
    .length,
  onBrandCount: mockReports.filter((report) => report.verdict === "on_brand")
    .length,
};

export function getReportById(reportId: string) {
  return mockReports.find((report) => report.id === reportId);
}

export function getBrandHealth() {
  return mockBrands.map((brand) => {
    const reports = mockReports.filter((report) => report.brandId === brand.id);
    const averageScore = reports.length
      ? Math.round(
          reports.reduce((total, report) => total + report.score, 0) /
            reports.length
        )
      : 0;
    return {
      brand,
      averageScore,
      latestReport: reports[0],
      reportCount: reports.length,
    };
  });
}
