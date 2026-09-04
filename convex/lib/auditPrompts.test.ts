import { describe, expect, it } from "vitest";

import type { Doc } from "../_generated/dataModel";
import type { AuditContentTypePolicy } from "./auditContentTypes";
import { buildAuditPrompt } from "./auditPrompts";

const brand = { name: "Acme Co" } as Doc<"brands">;
const policy: AuditContentTypePolicy = {
	label: "Ad copy",
	auditInstructions: "Scrutinize claims heavily.",
	scoringWeights: {
		toneAlignment: 0.15,
		messagingAlignment: 0.2,
		bannedPhraseSafety: 0.35,
		audienceFit: 0.1,
		clarityAndTrust: 0.2,
	},
	penaltyMultipliers: {
		mild_style: 1,
		hype_phrase: 1,
		banned_phrase: 1,
		absolute_claim: 1,
		direct_contradiction: 1,
	},
	scoreCaps: {
		oneHypeIssue: 78,
		oneBannedPhrase: 70,
		severeIssue: 54,
		multipleSevereIssues: 36,
	},
};

describe("buildAuditPrompt", () => {
	it("weaves the brand, content-type policy, content, and RAG context into the prompt", () => {
		const prompt = buildAuditPrompt({
			brand,
			contentTypePolicy: policy,
			content: "Get this deal now.",
			ragContext: "Tone: warm and confident.",
		});

		expect(prompt).toContain("Brand: Acme Co");
		expect(prompt).toContain("Content type: Ad copy");
		expect(prompt).toContain("Scrutinize claims heavily.");
		expect(prompt).toContain("Tone: warm and confident.");
		expect(prompt).toContain("Get this deal now.");
	});

	it("falls back to a placeholder when no RAG context was retrieved", () => {
		const prompt = buildAuditPrompt({
			brand,
			contentTypePolicy: policy,
			content: "Get this deal now.",
			ragContext: "",
		});

		expect(prompt).toContain("No relevant context was retrieved.");
	});

	it("instructs the model not to compute the final score or verdict itself", () => {
		const prompt = buildAuditPrompt({
			brand,
			contentTypePolicy: policy,
			content: "x",
			ragContext: "y",
		});

		expect(prompt).toMatch(/do not calculate the final overall score or verdict/i);
	});
});
