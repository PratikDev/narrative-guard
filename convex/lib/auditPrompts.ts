import type { Doc } from "../_generated/dataModel";

export function buildAuditPrompt(args: {
  brand: Doc<"brands">;
  contentType: Doc<"auditReports">["contentType"];
  content: string;
  ragContext: string;
}) {
  return `Evaluate the submitted content against the retrieved brand constitution.

Brand: ${args.brand.name}
Content type: ${args.contentType}

Retrieved brand constitution context:
${args.ragContext || "No relevant context was retrieved."}

Submitted content:
${args.content}

Return dimension scores, findings, a summary, and a rewrite. Do not calculate the final overall score or verdict.

Dimension scoring guidance:
- 90-100: strong alignment with clear brand-specific execution.
- 80-89: aligned with minor polish issues.
- 65-79: directionally aligned but needs review.
- 45-64: weak alignment or multiple conflicts.
- 0-44: severe conflict with the constitution.
- Score each dimension against the whole submitted content, not only the worst phrase.
- Do not collapse every dimension because of one isolated banned or risky phrase; findings handle issue-specific penalties separately.
- If most of the content follows the constitution and one phrase is risky, keep aligned dimensions near the aligned range and put the issue in findings.

Finding rules:
- Findings must quote exact submitted content in "sentence".
- Evidence must cite the relevant constitution rule or guidance from the retrieved context.
- Classify each finding using one issueType:
  - mild_style: vague, generic, wordy, or slightly off-tone wording.
  - hype_phrase: promotional or inflated wording that is not an absolute claim.
  - banned_phrase: a phrase that appears in, or closely matches, banned/risky language.
  - absolute_claim: guaranteed, risk-free, overnight, or certainty-based claim.
  - direct_contradiction: content directly conflicts with the constitution's required positioning or rules.
- Do not over-penalize one isolated issue when the rest of the content is aligned.
- Reserve absolute_claim and direct_contradiction for genuinely severe problems, not ordinary hype.
- Keep the rewrite suggestion publish-ready and aligned with the constitution.`;
}
