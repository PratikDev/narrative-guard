"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { Pie, PieChart } from "recharts";

import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
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
import { AUDIT_ISSUE_TYPE_LABELS } from "@/lib/constants";

type Props = { filters: AnalyticsFilters };

const chartConfig = {
	count: { label: "Findings" },
	low: { label: "Low", color: "hsl(var(--chart-1))" },
	medium: { label: "Medium", color: "hsl(var(--chart-2))" },
	high: { label: "High", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

const ISSUE_TYPES = Object.keys(
	AUDIT_ISSUE_TYPE_LABELS,
) as (keyof typeof AUDIT_ISSUE_TYPE_LABELS)[];

export function SeverityBreakdownChart({ filters }: Props) {
	const { workspaceId } = useWorkspace();
	const [issueType, setIssueType] = useState("all");

	const raw = useQuery(api.analytics.getSeverityBreakdown, {
		...filtersToQueryArgs(filters, workspaceId),
		issueType: issueType === "all" ? undefined : issueType,
	});

	const data = raw?.map((item) => ({
		...item,
		fill: `var(--color-${item.severity})`,
	}));

	const isEmpty = raw !== undefined && raw.every((item) => item.count === 0);

	return (
		<ChartCard
			title="Severity Breakdown"
			description="Distribution of findings by severity level."
			isLoading={raw === undefined}
			isEmpty={isEmpty}
			filterSlot={
				<Select
					value={issueType}
					onValueChange={setIssueType}
				>
					<SelectTrigger className="h-8 w-35 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All issue types</SelectItem>
						{ISSUE_TYPES.map((it) => (
							<SelectItem
								key={it}
								value={it}
							>
								{AUDIT_ISSUE_TYPE_LABELS[it]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			}
		>
			<ChartContainer
				config={chartConfig}
				className="mx-auto aspect-square h-70"
			>
				<PieChart>
					<ChartTooltip content={<ChartTooltipContent hideLabel />} />
					<Pie
						data={data}
						dataKey="count"
						nameKey="severity"
						innerRadius={55}
						outerRadius={90}
					/>
					<ChartLegend content={<ChartLegendContent nameKey="severity" />} />
				</PieChart>
			</ChartContainer>
		</ChartCard>
	);
}
