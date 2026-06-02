"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie } from "recharts";
import { ChartCard } from "./ChartCard";
import { filtersToQueryArgs } from "@/lib/analytics-utils";
import type { AnalyticsFilters } from "@/lib/analytics-types";

type Props = { filters: AnalyticsFilters };

const chartConfig = {
  count: { label: "Audits" },
  on_brand: { label: "On Brand", color: "hsl(var(--chart-1))" },
  needs_review: { label: "Needs Review", color: "hsl(var(--chart-2))" },
  off_brand: { label: "Off Brand", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

export function VerdictDistributionChart({ filters }: Props) {
  const { workspaceId } = useWorkspace();
  const raw = useQuery(api.analytics.getVerdictDistribution, filtersToQueryArgs(filters, workspaceId));

  const data = raw?.map((item) => ({
    ...item,
    fill: `var(--color-${item.verdict})`,
  }));

  const isEmpty = raw !== undefined && raw.every((item) => item.count === 0);

  return (
    <ChartCard
      title="Verdict Distribution"
      description="Split of on-brand, needs-review, and off-brand audits."
      isLoading={raw === undefined}
      isEmpty={isEmpty}
    >
      <ChartContainer config={chartConfig} className="mx-auto aspect-square h-70">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="count" nameKey="verdict" innerRadius={55} outerRadius={90} />
          <ChartLegend content={<ChartLegendContent nameKey="verdict" />} />
        </PieChart>
      </ChartContainer>
    </ChartCard>
  );
}
