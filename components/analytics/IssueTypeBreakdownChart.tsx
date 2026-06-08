"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ChartCard } from "./ChartCard";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { api } from "@/convex/_generated/api";
import type { AnalyticsFilters } from "@/lib/analytics-types";
import { filtersToQueryArgs } from "@/lib/analytics-utils";

type Props = { filters: AnalyticsFilters };

const chartConfig = {
	count: { label: "Findings", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

export function IssueTypeBreakdownChart({ filters }: Props) {
	const { workspaceId } = useWorkspace();
	const [severity, setSeverity] = useState("all");

	const data = useQuery(api.analytics.getIssueTypeBreakdown, {
		...filtersToQueryArgs(filters, workspaceId),
		severity: severity === "all" ? undefined : severity,
	});

	return (
		<ChartCard
			title="Issue Type Breakdown"
			description="Most common brand alignment problems."
			isLoading={data === undefined}
			isEmpty={data?.length === 0}
			filterSlot={
				<Select
					value={severity}
					onValueChange={setSeverity}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select severity" />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="all">All severities</SelectItem>
						<SelectItem value="low">Low</SelectItem>
						<SelectItem value="medium">Medium</SelectItem>
						<SelectItem value="high">High</SelectItem>
					</SelectContent>
				</Select>
			}
		>
			<ChartContainer
				config={chartConfig}
				className="h-70 w-full"
			>
				<BarChart
					data={data}
					layout="vertical"
				>
					<CartesianGrid horizontal={false} />
					<XAxis
						type="number"
						tickLine={false}
						axisLine={false}
						tick={{ fontSize: 12 }}
						allowDecimals={false}
					/>
					<YAxis
						type="category"
						dataKey="label"
						width={130}
						tickLine={false}
						axisLine={false}
						tick={{ fontSize: 11 }}
					/>
					<ChartTooltip content={<ChartTooltipContent />} />
					<Bar
						dataKey="count"
						fill="var(--color-count)"
						radius={[0, 4, 4, 0]}
					/>
				</BarChart>
			</ChartContainer>
		</ChartCard>
	);
}
