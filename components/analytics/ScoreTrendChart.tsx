"use client";

import { useQuery } from "convex/react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
	avgScore: { label: "Avg Score", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ScoreTrendChart({ filters }: Props) {
	const { workspaceId } = useWorkspace();
	const data = useQuery(
		api.analytics.getScoreTrend,
		filtersToQueryArgs(filters, workspaceId),
	);

	return (
		<ChartCard
			title="Score Trend"
			description="Average audit score over time."
			isLoading={data === undefined}
			isEmpty={data?.length === 0}
		>
			<ChartContainer
				config={chartConfig}
				className="h-70 w-full"
			>
				<AreaChart data={data}>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey="date"
						tickLine={false}
						axisLine={false}
						tick={{ fontSize: 12 }}
					/>
					<YAxis
						domain={[0, 100]}
						tickLine={false}
						axisLine={false}
						tick={{ fontSize: 12 }}
					/>
					<ChartTooltip content={<ChartTooltipContent />} />
					<Area
						type="monotone"
						dataKey="avgScore"
						stroke="var(--color-avgScore)"
						fill="var(--color-avgScore)"
						fillOpacity={0.25}
						strokeWidth={2}
					/>
				</AreaChart>
			</ChartContainer>
		</ChartCard>
	);
}
