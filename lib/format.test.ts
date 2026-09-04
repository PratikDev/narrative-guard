import { describe, expect, it } from "vitest";

import { formatDate, formatScore, formatUserDisplay } from "./format";

describe("formatDate", () => {
	// Runner TZ is pinned to UTC in vitest.config.ts.
	it("formats a timestamp as 'Mon D, YYYY'", () => {
		const formatted = formatDate(Date.parse("2026-09-15T12:00:00.000Z"));
		expect(formatted).toMatch(/^Sep\s15,\s2026$/);
	});

	it("accepts an ISO date string", () => {
		expect(formatDate("2026-01-05")).toMatch(/^Jan\s5,\s2026$/);
	});
});

describe("formatScore", () => {
	it("rounds to a whole-number string", () => {
		expect(formatScore(87)).toBe("87");
		expect(formatScore(87.4)).toBe("87");
		expect(formatScore(87.5)).toBe("88");
		expect(formatScore(0)).toBe("0");
	});
});

describe("formatUserDisplay", () => {
	it("prefers the name, then the email, then a generic fallback", () => {
		expect(formatUserDisplay({ name: "Ada", email: "ada@example.com" })).toBe(
			"Ada",
		);
		expect(formatUserDisplay({ name: null, email: "ada@example.com" })).toBe(
			"ada@example.com",
		);
		expect(formatUserDisplay({ name: "", email: "ada@example.com" })).toBe(
			"ada@example.com",
		);
		expect(formatUserDisplay({ name: null, email: null })).toBe("Unknown user");
		expect(formatUserDisplay(null)).toBe("Unknown user");
	});
});
