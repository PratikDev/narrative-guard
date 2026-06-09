"use client";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { EmptyState } from "@/components/shared/EmptyState";
import { ScoreDisplay } from "@/components/shared/ScoreDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import type { AnalyticsFilters } from "@/lib/analytics-types";
import { exportToCsv, filtersToQueryArgs } from "@/lib/analytics-utils";
import {
	AUDIT_ISSUE_TYPE_LABELS,
	CONTENT_TYPE_LABELS,
	VERDICT_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Verdict } from "@/lib/types";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";

type Props = { filters: AnalyticsFilters };

export function RiskyAuditsTable({ filters }: Props) {
	const { workspaceId } = useWorkspace();
	const [verdict, setVerdict] = useState("all");
	const [severity, setSeverity] = useState("all");

	const data = useQuery(api.analytics.getRiskyAudits, {
		...filtersToQueryArgs(filters, workspaceId),
		verdict: verdict === "all" ? undefined : verdict,
		severity: severity === "all" ? undefined : severity,
		limit: 100,
	});

	function handleExport() {
		if (!data) return;
		exportToCsv(
			data.map((r) => ({
				Date: formatDate(r.date),
				Brand: r.brandName,
				"Content Type": CONTENT_TYPE_LABELS[r.contentType] ?? r.contentType,
				Score: r.score,
				Verdict: VERDICT_LABELS[r.verdict],
				"Main Issue": r.mainIssueType
					? (AUDIT_ISSUE_TYPE_LABELS[
							r.mainIssueType as keyof typeof AUDIT_ISSUE_TYPE_LABELS
						] ?? r.mainIssueType)
					: "",
				Findings: r.findingsCount,
				"Created By": r.auditorName ?? r.auditorEmail ?? "",
			})),
			"risky-audits.csv",
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<CardTitle className="text-base">Recent Risky Audits</CardTitle>
					<div className="flex flex-wrap items-center gap-2">
						<Select
							value={verdict}
							onValueChange={setVerdict}
						>
							<SelectTrigger className="h-8 w-35 text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All verdicts</SelectItem>
								{(Object.keys(VERDICT_LABELS) as Verdict[]).map((v) => (
									<SelectItem
										key={v}
										value={v}
									>
										{VERDICT_LABELS[v]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={severity}
							onValueChange={setSeverity}
						>
							<SelectTrigger className="h-8 w-32.5 text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All severities</SelectItem>
								<SelectItem value="low">Low</SelectItem>
								<SelectItem value="medium">Medium</SelectItem>
								<SelectItem value="high">High</SelectItem>
							</SelectContent>
						</Select>

						<Button
							variant="outline"
							size="sm"
							onClick={handleExport}
							disabled={!data?.length}
						>
							Export CSV
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{data === undefined ? (
					<Skeleton className="h-60 w-full" />
				) : data.length === 0 ? (
					<EmptyState
						title="No risky audits"
						description="No off-brand or low-scoring audits match the current filters."
					/>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Brand</TableHead>
									<TableHead>Content Type</TableHead>
									<TableHead>Score</TableHead>
									<TableHead>Verdict</TableHead>
									<TableHead>Main Issue</TableHead>
									<TableHead>Findings</TableHead>
									<TableHead>Created By</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.map((row) => (
									<TableRow key={row.reportId}>
										<TableCell className="whitespace-nowrap text-sm">
											{formatDate(row.date)}
										</TableCell>
										<TableCell className="font-medium">
											{row.brandName}
										</TableCell>
										<TableCell className="text-sm">
											{CONTENT_TYPE_LABELS[row.contentType] ?? row.contentType}
										</TableCell>
										<TableCell className="text-right">
											<ScoreDisplay
												score={row.score}
												size="sm"
											/>
										</TableCell>
										<TableCell>
											<StatusBadge verdict={row.verdict as Verdict} />
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{row.mainIssueType
												? (AUDIT_ISSUE_TYPE_LABELS[
														row.mainIssueType as keyof typeof AUDIT_ISSUE_TYPE_LABELS
													] ?? row.mainIssueType)
												: "—"}
										</TableCell>
										<TableCell>{row.findingsCount}</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{row.auditorName ?? row.auditorEmail ?? "—"}
										</TableCell>
										<TableCell>
											<Button
												variant="outline"
												size="sm"
												asChild
											>
												<Link href={`/reports/${row.reportId}`}>View</Link>
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
