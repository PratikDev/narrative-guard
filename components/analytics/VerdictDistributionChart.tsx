"use client";

import { useQuery } from "convex/react";
import { Pie, PieChart } from "recharts";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
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
	count: { label: "Audits" },
	on_brand: { label: "On Brand", color: "var(--chart-1)" },
	needs_review: { label: "Needs Review", color: "var(--chart-2)" },
	off_brand: { label: "Off Brand", color: "var(--chart-risk)" },
} satisfies ChartConfig;

export function VerdictDistributionChart({ filters }: Props) {
	const { workspaceId } = useWorkspace();
	const raw = useQuery(
		api.analytics.getVerdictDistribution,
		filtersToQueryArgs(filters, workspaceId),
	);

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
			<ChartContainer
				config={chartConfig}
				className="mx-auto aspect-square h-70"
			>
				<PieChart>
					<ChartTooltip content={<ChartTooltipContent hideLabel />} />
					<Pie
						data={data}
						dataKey="count"
						nameKey="verdict"
						innerRadius={55}
						outerRadius={90}
					/>
					<ChartLegend content={<ChartLegendContent nameKey="verdict" />} />
				</PieChart>
			</ChartContainer>
		</ChartCard>
	);
}
