import { v } from "convex/values";
import { mutation } from "./_generated/server";

const contentType = v.union(
  v.literal("generic"),
  v.literal("social_post"),
  v.literal("website_copy"),
  v.literal("email"),
  v.literal("press_release"),
  v.literal("ad_copy")
);

function splitSentences(content: string) {
  return content
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function sentenceWith(content: string, patterns: string[]) {
  const sentences = splitSentences(content);
  return (
    sentences.find((sentence) =>
      patterns.some((pattern) => sentence.toLowerCase().includes(pattern))
    ) ?? sentences[0] ?? content
  );
}

function createMockResult(content: string) {
  const normalized = content.toLowerCase();
  const findings: Array<{
    sentence: string;
    reason: string;
    severity: "low" | "medium" | "high";
  }> = [];

  let score = 88;

  if (
    ["guarantee", "guaranteed", "risk-free", "eliminate all risk"].some(
      (term) => normalized.includes(term)
    )
  ) {
    score -= 24;
    findings.push({
      sentence: sentenceWith(content, [
        "guarantee",
        "guaranteed",
        "risk-free",
        "eliminate all risk",
      ]),
      reason:
        "The wording creates an absolute promise, which weakens trust and should be softened.",
      severity: "high",
    });
  }

  if (
    ["explosive", "10x", "overnight", "crush", "unlock unlimited"].some(
      (term) => normalized.includes(term)
    )
  ) {
    score -= 18;
    findings.push({
      sentence: sentenceWith(content, [
        "explosive",
        "10x",
        "overnight",
        "crush",
        "unlock unlimited",
      ]),
      reason:
        "The phrase reads as hype-driven and should be replaced with calmer operating value.",
      severity: "medium",
    });
  }

  if (content.length < 80) {
    score -= 8;
    findings.push({
      sentence: content,
      reason:
        "The copy is brief enough that it may need more context to show brand-specific value.",
      severity: "low",
    });
  }

  score = Math.max(42, Math.min(94, score));
  const verdict =
    score >= 85 ? "on_brand" : score >= 65 ? "needs_review" : "off_brand";

  return {
    score,
    verdict,
    summary:
      verdict === "on_brand"
        ? "The content is clear, restrained, and aligned with the selected brand's guidance."
        : verdict === "needs_review"
          ? "The content is directionally aligned, but a few phrases should be tightened before publishing."
          : "The content contains claims or tone choices that conflict with the selected brand's guidance.",
    dimensionScores: {
      toneAlignment: Math.max(40, Math.min(96, score + 2)),
      messagingAlignment: Math.max(40, Math.min(96, score)),
      bannedPhraseSafety: Math.max(35, Math.min(98, score - findings.length * 5)),
      audienceFit: Math.max(45, Math.min(94, score + 1)),
      clarityAndTrust: Math.max(40, Math.min(95, score - 2)),
    },
    findings,
    rewriteSuggestion:
      verdict === "on_brand"
        ? content
        : "Revise the copy to lead with practical value, use calm and specific language, and avoid absolute claims or hype-driven phrases.",
  } as const;
}

export const createManualAudit = mutation({
  args: {
    brandId: v.id("brands"),
    contentType,
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const brand = await ctx.db.get(args.brandId);
    if (!brand) {
      throw new Error("Brand not found.");
    }

    const now = Date.now();
    const result = createMockResult(args.content.trim());

    const reportId = await ctx.db.insert("auditReports", {
      brandId: args.brandId,
      contentType: args.contentType,
      originalContent: args.content.trim(),
      score: result.score,
      verdict: result.verdict,
      summary: result.summary,
      ...result.dimensionScores,
      rewriteSuggestion: result.rewriteSuggestion,
      status: "complete",
      createdAt: now,
      updatedAt: now,
    });

    for (const finding of result.findings) {
      await ctx.db.insert("auditFindings", {
        reportId,
        brandId: args.brandId,
        sentence: finding.sentence,
        reason: finding.reason,
        severity: finding.severity,
        createdAt: now,
      });
    }

    return { reportId };
  },
});
