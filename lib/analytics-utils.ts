import type { AnalyticsFilters, AnalyticsQueryArgs, DateRange, DateRangePreset } from "./analytics-types";
import type { Id } from "@/convex/_generated/dataModel";

export function dateRangeToTimestamps(preset: DateRangePreset): DateRange {
  if (preset === "all") return { fromTs: undefined, toTs: undefined };
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const toTs = Date.now();
  const fromTs = toTs - days * 24 * 60 * 60 * 1000;
  return { fromTs, toTs };
}

export function getPreviousPeriodRange(current: DateRange): DateRange {
  if (!current.fromTs || !current.toTs) return { fromTs: undefined, toTs: undefined };
  const span = current.toTs - current.fromTs;
  return { fromTs: current.fromTs - span, toTs: current.fromTs };
}

export function filtersToQueryArgs(
  filters: AnalyticsFilters,
  workspaceId: Id<"workspaces"> | undefined,
): AnalyticsQueryArgs {
  const { fromTs, toTs } = dateRangeToTimestamps(filters.datePreset);
  return {
    workspaceId,
    fromTs,
    toTs,
    brandId: filters.brandId === "all" ? undefined : filters.brandId,
    contentType: filters.contentType === "all" ? undefined : filters.contentType,
    memberId: filters.memberId === "all" ? undefined : filters.memberId,
  };
}

export function trendPercent(current: number, previous: number | null): number | null {
  if (previous === null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function formatTrend(pct: number | null): string | null {
  if (pct === null) return null;
  return pct >= 0 ? `↑ ${pct}% vs prev period` : `↓ ${Math.abs(pct)}% vs prev period`;
}

export function fillDateGaps(
  data: Array<{ date: string; [key: string]: unknown }>,
  fromTs: number | undefined,
  toTs: number | undefined,
  defaultValues: Record<string, unknown>,
): Array<{ date: string; [key: string]: unknown }> {
  if (!fromTs || !toTs || data.length === 0) return data;

  const byDate = new Map(data.map((d) => [d.date, d]));
  const result: Array<{ date: string; [key: string]: unknown }> = [];
  const cursor = new Date(fromTs);
  const end = new Date(toTs);
  cursor.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    result.push(byDate.get(key) ?? { date: key, ...defaultValues });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

export function exportToCsv(rows: Record<string, unknown>[], filename: string): void {
  if (typeof window === "undefined" || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function toDateKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}
