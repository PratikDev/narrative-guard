"use client";

import { useQuery } from "convex/react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
	avgScore: { label: "Avg Score", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function ContentTypePerformanceChart({ filters }: Props) {
	const { workspaceId } = useWorkspace();
	const { fromTs, toTs, brandId, memberId } = filtersToQueryArgs(
		filters,
		workspaceId,
	);
	const data = useQuery(api.analytics.getContentTypePerformance, {
		workspaceId,
		fromTs,
		toTs,
		brandId,
		memberId,
	});

	return (
		<ChartCard
			title="Content Type Performance"
			description="Average score by content format."
			isLoading={data === undefined}
			isEmpty={data?.length === 0}
		>
			<ChartContainer
				config={chartConfig}
				className="h-70 w-full"
			>
				<BarChart data={data}>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey="label"
						tickLine={false}
						axisLine={false}
						tick={{ fontSize: 11 }}
					/>
					<YAxis
						domain={[0, 100]}
						tickLine={false}
						axisLine={false}
						tick={{ fontSize: 12 }}
					/>
					<ChartTooltip content={<ChartTooltipContent />} />
					<Bar
						dataKey="avgScore"
						fill="var(--color-avgScore)"
						radius={[4, 4, 0, 0]}
					/>
				</BarChart>
			</ChartContainer>
		</ChartCard>
	);
}
