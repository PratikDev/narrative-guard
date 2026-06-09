"use client";

import { useQuery } from "convex/react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import { ChartCard } from "./ChartCard";

import { api } from "@/convex/_generated/api";
import type { AnalyticsFilters } from "@/lib/analytics-types";
import { filtersToQueryArgs } from "@/lib/analytics-utils";

type Props = { filters: AnalyticsFilters };

const chartConfig = {
	avgValue: { label: "Avg Score", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ScoreDimensionRadarChart({ filters }: Props) {
	const { workspaceId } = useWorkspace();
	const data = useQuery(
		api.analytics.getScoreDimensionBreakdown,
		filtersToQueryArgs(filters, workspaceId),
	);

	return (
		<ChartCard
			title="Score Dimension Breakdown"
			description="Average performance across all 5 brand voice dimensions."
			isLoading={data === undefined}
			isEmpty={data?.length === 0}
		>
			<ChartContainer
				config={chartConfig}
				className="mx-auto aspect-square h-70"
			>
				<RadarChart data={data}>
					<PolarGrid />
					<PolarAngleAxis
						dataKey="label"
						tick={{ fontSize: 11 }}
					/>
					<ChartTooltip content={<ChartTooltipContent />} />
					<Radar
						dataKey="avgValue"
						fill="var(--color-avgValue)"
						fillOpacity={0.35}
						stroke="var(--color-avgValue)"
						strokeWidth={2}
					/>
				</RadarChart>
			</ChartContainer>
		</ChartCard>
	);
}
