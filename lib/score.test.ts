import { describe, expect, it } from "vitest";

import { verdictFromScore } from "@/convex/lib/auditScoring";
import { getScoreTone, getSeverityClass, getVerdictBadgeClass } from "./score";

describe("getScoreTone", () => {
	it("switches tone at the 85 and 65 thresholds", () => {
		expect(getScoreTone(100)).toBe(getScoreTone(85));
		expect(getScoreTone(84)).toBe(getScoreTone(65));
		expect(getScoreTone(64)).toBe(getScoreTone(0));
		// the three bands are visually distinct
		expect(new Set([getScoreTone(90), getScoreTone(70), getScoreTone(40)]).size).toBe(3);
	});

	it("lines up with the backend verdict thresholds", () => {
		const toneForVerdict = {
			on_brand: getScoreTone(90),
			needs_review: getScoreTone(70),
			off_brand: getScoreTone(40),
		};
		for (const value of [100, 85, 84, 65, 64, 0]) {
			expect(getScoreTone(value)).toBe(toneForVerdict[verdictFromScore(value)]);
		}
	});
});

describe("getVerdictBadgeClass", () => {
	it("returns a distinct class per verdict", () => {
		const classes = [
			getVerdictBadgeClass("on_brand"),
			getVerdictBadgeClass("needs_review"),
			getVerdictBadgeClass("off_brand"),
		];
		expect(new Set(classes).size).toBe(3);
		expect(getVerdictBadgeClass("on_brand")).toContain("emerald");
		expect(getVerdictBadgeClass("off_brand")).toContain("red");
	});
});

describe("getSeverityClass", () => {
	it("returns a distinct class per severity", () => {
		const classes = [
			getSeverityClass("low"),
			getSeverityClass("medium"),
			getSeverityClass("high"),
		];
		expect(new Set(classes).size).toBe(3);
		expect(getSeverityClass("high")).toContain("red");
	});
});
