"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartCard } from "./ChartCard";
import { filtersToQueryArgs } from "@/lib/analytics-utils";
import type { AnalyticsFilters } from "@/lib/analytics-types";

type Props = { filters: AnalyticsFilters };

const chartConfig = {
  count: { label: "Audits", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function AuditVolumeChart({ filters }: Props) {
  const { workspaceId } = useWorkspace();
  const data = useQuery(api.analytics.getAuditVolume, filtersToQueryArgs(filters, workspaceId));

  return (
    <ChartCard
      title="Audit Volume"
      description="Number of audits run over time."
      isLoading={data === undefined}
      isEmpty={data?.length === 0}
    >
      <ChartContainer config={chartConfig} className="h-70 w-full">
        <AreaChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--color-count)"
            fill="var(--color-count)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}
