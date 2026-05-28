"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { BrandHealthSummary } from "@/components/dashboard/BrandHealthSummary";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentReports } from "@/components/dashboard/RecentReports";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";

export default function DashboardPage() {
	const { workspaceId } = useWorkspace();
	const workspaceArgs = workspaceId ? { workspaceId } : {};
	const stats = useQuery(api.report.getDashboardStats, workspaceArgs);
	const { results: reports } = usePaginatedQuery(
		api.report.listReports,
		workspaceArgs,
		{ initialNumItems: 5 },
	);
	const health = useQuery(api.report.getBrandHealth, workspaceArgs);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title="Dashboard"
				description="Review audit volume, brand health, and the latest coherence reports across active brands."
				actions={
					<>
						<Button
							variant="outline"
							asChild
						>
							<Link href="/setup">
								<ShieldCheck data-icon="inline-start" />
								Create brand
							</Link>
						</Button>
						<Button asChild>
							<Link href="/audit">
								<FileText data-icon="inline-start" />
								Run audit
							</Link>
						</Button>
					</>
				}
			/>
			<DashboardStats
				stats={
					stats ?? {
						totalReports: 0,
						averageScore: 0,
						needsReviewCount: 0,
						offBrandCount: 0,
						onBrandCount: 0,
					}
				}
			/>
			<div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
				<RecentReports reports={reports} />
				<BrandHealthSummary health={health ?? []} />
			</div>
		</div>
	);
}
