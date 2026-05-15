"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { ScoreDisplay } from "@/components/shared/ScoreDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	CONTENT_TYPE_LABELS,
	CONTENT_TYPES,
	VERDICT_LABELS,
	VERDICTS,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { AuditReport, ContentType, Verdict } from "@/lib/types";
import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function ReportHistoryTable({ reports }: { reports: AuditReport[] }) {
	const [query, setQuery] = useState("");
	const [verdict, setVerdict] = useState<Verdict | "all">("all");
	const [contentType, setContentType] = useState<ContentType | "all">("all");

	const filteredReports = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		return reports.filter((report) => {
			const matchesQuery =
				!normalized ||
				report.brandName.toLowerCase().includes(normalized) ||
				report.originalContent.toLowerCase().includes(normalized) ||
				report.summary.toLowerCase().includes(normalized);
			const matchesVerdict = verdict === "all" || report.verdict === verdict;
			const matchesType =
				contentType === "all" || report.contentType === contentType;
			return matchesQuery && matchesVerdict && matchesType;
		});
	}, [contentType, query, reports, verdict]);

	if (!reports.length) {
		return (
			<EmptyState
				title="No reports yet"
				description="Run your first audit to create a brand coherence report."
				actionHref="/audit"
				actionLabel="Run first audit"
			/>
		);
	}

	return (
		<div className="space-y-4">
			<div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
				<label className="relative">
					<span className="sr-only">Search by brand or content</span>
					<Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
					<Input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search by brand or content"
						className="pl-8"
					/>
				</label>
				<Select
					value={verdict}
					onValueChange={(value) => {
						if (value) setVerdict(value as Verdict | "all");
					}}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Filter by verdict" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All verdicts</SelectItem>
						{VERDICTS.map((item) => (
							<SelectItem
								key={item}
								value={item}
							>
								{VERDICT_LABELS[item]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={contentType}
					onValueChange={(value) => {
						if (value) setContentType(value as ContentType | "all");
					}}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Filter by content type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All content types</SelectItem>
						{CONTENT_TYPES.map((item) => (
							<SelectItem
								key={item}
								value={item}
							>
								{CONTENT_TYPE_LABELS[item]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{filteredReports.length ? (
				<div className="overflow-x-auto rounded-lg border bg-card">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Brand name</TableHead>
								<TableHead>Content type</TableHead>
								<TableHead>Score</TableHead>
								<TableHead>Verdict</TableHead>
								<TableHead>Summary</TableHead>
								<TableHead>Date</TableHead>
								<TableHead className="text-right">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredReports.map((report) => (
								<TableRow key={report.id}>
									<TableCell className="font-medium">
										{report.brandName}
									</TableCell>
									<TableCell>
										{CONTENT_TYPE_LABELS[report.contentType]}
									</TableCell>
									<TableCell>
										<ScoreDisplay
											score={report.score}
											size="sm"
										/>
									</TableCell>
									<TableCell>
										<StatusBadge verdict={report.verdict} />
									</TableCell>
									<TableCell className="max-w-xs text-muted-foreground whitespace-normal">
										{report.summary}
									</TableCell>
									<TableCell>{formatDate(report.createdAt)}</TableCell>
									<TableCell className="text-right">
										<Button
											variant="outline"
											size="sm"
											render={<Link href={`/reports/${report.id}`} />}
										>
											Open report
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			) : (
				<EmptyState
					title="No matching reports"
					description="Adjust the search text or filters to review more audit history."
				/>
			)}
		</div>
	);
}
