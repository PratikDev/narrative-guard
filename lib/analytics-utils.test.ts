import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Id } from "@/convex/_generated/dataModel";
import type { AnalyticsFilters } from "./analytics-types";
import {
	dateRangeToTimestamps,
	fillDateGaps,
	filtersToQueryArgs,
	formatTrend,
	getPreviousPeriodRange,
	toDateKey,
	trendPercent,
} from "./analytics-utils";

const DAY = 86_400_000;
// Runner TZ is pinned to UTC in vitest.config.ts, so local-time date math is deterministic.
const NOW = new Date("2026-09-15T12:34:56.000Z");

describe("dateRangeToTimestamps", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(NOW);
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns an open range for the 'all' preset", () => {
		expect(dateRangeToTimestamps("all")).toEqual({
			fromTs: undefined,
			toTs: undefined,
		});
	});

	it("spans exactly N days (start-of-day to end-of-day) for each preset", () => {
		const cases: [AnalyticsFilters["datePreset"], number][] = [
			["7d", 7],
			["30d", 30],
			["90d", 90],
		];
		for (const [preset, days] of cases) {
			const { fromTs, toTs } = dateRangeToTimestamps(preset);
			expect(toTs! - fromTs!).toBe(days * DAY - 1);
			expect(new Date(fromTs!).toISOString()).toMatch(/T00:00:00\.000Z$/);
			expect(new Date(toTs!).toISOString()).toBe("2026-09-15T23:59:59.999Z");
		}
	});

	it("starts the 7d window six calendar days before today", () => {
		const { fromTs } = dateRangeToTimestamps("7d");
		expect(new Date(fromTs!).toISOString().slice(0, 10)).toBe("2026-09-09");
	});
});

describe("getPreviousPeriodRange", () => {
	it("returns the equally-sized window immediately before the current one", () => {
		expect(getPreviousPeriodRange({ fromTs: 1000, toTs: 4000 })).toEqual({
			fromTs: -2000,
			toTs: 1000,
		});
	});

	it("stays open when the current range is open", () => {
		expect(
			getPreviousPeriodRange({ fromTs: undefined, toTs: undefined }),
		).toEqual({ fromTs: undefined, toTs: undefined });
		expect(getPreviousPeriodRange({ fromTs: 5000, toTs: undefined })).toEqual({
			fromTs: undefined,
			toTs: undefined,
		});
	});
});

describe("trendPercent", () => {
	it("computes rounded percentage change", () => {
		expect(trendPercent(150, 100)).toBe(50);
		expect(trendPercent(80, 100)).toBe(-20);
		expect(trendPercent(100, 100)).toBe(0);
		expect(trendPercent(10, 3)).toBe(233);
	});

	it("returns null when the previous value is null or zero", () => {
		expect(trendPercent(5, null)).toBeNull();
		expect(trendPercent(5, 0)).toBeNull();
	});
});

describe("formatTrend", () => {
	it("renders an up arrow for non-negative percentages", () => {
		expect(formatTrend(50)).toBe("↑ 50% vs prev period");
		expect(formatTrend(0)).toBe("↑ 0% vs prev period");
	});

	it("renders a down arrow with the absolute value for negatives", () => {
		expect(formatTrend(-20)).toBe("↓ 20% vs prev period");
	});

	it("returns null for a null percentage", () => {
		expect(formatTrend(null)).toBeNull();
	});
});

describe("filtersToQueryArgs", () => {
	const baseFilters: AnalyticsFilters = {
		datePreset: "all",
		brandId: "all",
		contentType: "all",
		memberId: "all",
	};
	const workspaceId = "ws_1" as Id<"workspaces">;

	it("maps the 'all' sentinel to undefined for each dimension", () => {
		expect(filtersToQueryArgs(baseFilters, workspaceId)).toEqual({
			workspaceId,
			fromTs: undefined,
			toTs: undefined,
			brandId: undefined,
			contentType: undefined,
			memberId: undefined,
		});
	});

	it("passes concrete filter values through", () => {
		const result = filtersToQueryArgs(
			{
				datePreset: "all",
				brandId: "brand_1" as Id<"brands">,
				contentType: "email",
				memberId: "user_1" as Id<"users">,
			},
			workspaceId,
		);
		expect(result).toMatchObject({
			workspaceId,
			brandId: "brand_1",
			contentType: "email",
			memberId: "user_1",
		});
	});
});

describe("fillDateGaps", () => {
	const from = Date.parse("2026-09-01T00:00:00.000Z");
	const to = Date.parse("2026-09-03T00:00:00.000Z");

	it("inserts a default row for each missing calendar day in the range", () => {
		const filled = fillDateGaps(
			[{ date: "2026-09-02", count: 5 }],
			from,
			to,
			{ count: 0 },
		);
		expect(filled).toEqual([
			{ date: "2026-09-01", count: 0 },
			{ date: "2026-09-02", count: 5 },
			{ date: "2026-09-03", count: 0 },
		]);
	});

	it("returns the input untouched when the range or data is missing", () => {
		const data = [{ date: "2026-09-02", count: 5 }];
		expect(fillDateGaps(data, undefined, to, { count: 0 })).toBe(data);
		expect(fillDateGaps(data, from, undefined, { count: 0 })).toBe(data);
		expect(fillDateGaps([], from, to, { count: 0 })).toEqual([]);
	});
});

describe("toDateKey", () => {
	it("formats a timestamp as a YYYY-MM-DD UTC key", () => {
		expect(toDateKey(Date.parse("2026-09-15T12:00:00.000Z"))).toBe("2026-09-15");
		expect(toDateKey(Date.parse("2026-01-01T00:00:00.000Z"))).toBe("2026-01-01");
	});
});
