"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartCard } from "./ChartCard";
import { filtersToQueryArgs } from "@/lib/analytics-utils";
import type { AnalyticsFilters } from "@/lib/analytics-types";

type Props = { filters: AnalyticsFilters };

const chartConfig = {
  avgScore: { label: "Avg Score", color: "hsl(var(--chart-1))" },
  auditCount: { label: "Audit Count", color: "hsl(var(--chart-2))" },
  offBrandCount: { label: "Off Brand", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

export function BrandComparisonChart({ filters }: Props) {
  const { workspaceId } = useWorkspace();
  const { fromTs, toTs, contentType, memberId } = filtersToQueryArgs(filters, workspaceId);
  const data = useQuery(api.analytics.getBrandComparison, {
    workspaceId,
    fromTs,
    toTs,
    contentType,
    memberId,
  });

  return (
    <ChartCard
      title="Brand Comparison"
      description="Score, volume, and risk level per brand."
      isLoading={data === undefined}
      isEmpty={data?.length === 0}
    >
      <ChartContainer config={chartConfig} className="h-70 w-full">
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="brandName" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="avgScore" fill="var(--color-avgScore)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="auditCount" fill="var(--color-auditCount)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="offBrandCount" fill="var(--color-offBrandCount)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
