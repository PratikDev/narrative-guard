"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { MetricCard } from "@/components/shared/MetricCard";
import { Skeleton } from "@/components/ui/skeleton";
import { filtersToQueryArgs, getPreviousPeriodRange, trendPercent, formatTrend } from "@/lib/analytics-utils";
import type { AnalyticsFilters } from "@/lib/analytics-types";

type Props = { filters: AnalyticsFilters };

export function AnalyticsSummaryCards({ filters }: Props) {
  const { workspaceId } = useWorkspace();
  const base = filtersToQueryArgs(filters, workspaceId);
  const prev = getPreviousPeriodRange({ fromTs: base.fromTs, toTs: base.toTs });

  const data = useQuery(api.analytics.getAnalyticsSummary, {
    ...base,
    prevFromTs: prev.fromTs,
    prevToTs: prev.toTs,
  });

  if (data === undefined) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const trend = (current: number, previous: number | undefined) =>
    formatTrend(trendPercent(current, previous ?? null)) ?? undefined;

  const cards = [
    { label: "Total Audits", value: data.totalAudits, helper: trend(data.totalAudits, data.prev?.totalAudits) },
    { label: "Average Score", value: data.avgScore, helper: trend(data.avgScore, data.prev?.avgScore) },
    { label: "On Brand", value: data.onBrandCount, helper: trend(data.onBrandCount, data.prev?.onBrandCount) },
    { label: "Needs Review", value: data.needsReviewCount, helper: trend(data.needsReviewCount, data.prev?.needsReviewCount) },
    { label: "Off Brand", value: data.offBrandCount, helper: trend(data.offBrandCount, data.prev?.offBrandCount) },
    { label: "Total Findings", value: data.totalFindings, helper: trend(data.totalFindings, data.prev?.totalFindings) },
    { label: "Active Brands", value: data.activeBrands },
    { label: "Active Runners", value: data.activeRunners },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.label} label={card.label} value={card.value} helper={card.helper} />
      ))}
    </div>
  );
}
