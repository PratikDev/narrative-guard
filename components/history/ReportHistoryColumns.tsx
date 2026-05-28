"use client";

import { DeleteReportButton } from "@/components/reports/DeleteReportButton";
import { DownloadReportButton } from "@/components/reports/DownloadReportButton";
import { AuditReportStatusBadge } from "@/components/shared/AuditReportStatusBadge";
import { ScoreDisplay } from "@/components/shared/ScoreDisplay";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { isCompletedAuditReport } from "@/lib/audit-report";
import type { AuditReport } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export const reportHistoryColumns: ColumnDef<AuditReport>[] = [
	{
		accessorKey: "brandName",
		header: "Brand name",
		cell: ({ row }) => (
			<span className="font-medium">{row.original.brandName}</span>
		),
	},
	{
		accessorKey: "contentType",
		header: "Content type",
		filterFn: (row, _columnId, value) =>
			value ? row.original.contentType === value : true,
		cell: ({ row }) => CONTENT_TYPE_LABELS[row.original.contentType],
	},
	{
		accessorKey: "score",
		header: "Score",
		cell: ({ row }) =>
			isCompletedAuditReport(row.original) ? (
				<ScoreDisplay
					score={row.original.score}
					size="sm"
				/>
			) : (
				<span className="text-muted-foreground">Pending</span>
			),
	},
	{
		accessorKey: "verdict",
		header: "Verdict",
		filterFn: (row, _columnId, value) =>
			value ? isCompletedAuditReport(row.original) && row.original.verdict === value : true,
		cell: ({ row }) => <AuditReportStatusBadge report={row.original} />,
	},
	{
		accessorKey: "summary",
		header: "Summary",
		cell: ({ row }) => (
			<p className="line-clamp-3 max-w-xs whitespace-normal text-muted-foreground">
				{row.original.summary}
			</p>
		),
	},
	{
		accessorKey: "createdAt",
		header: "Date",
		cell: ({ row }) => formatDate(row.original.createdAt),
	},
	{
		id: "actions",
		header: () => <div className="text-right">Actions</div>,
		cell: ({ row }) => (
			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					size="sm"
					asChild
				>
					<Link href={`/reports/${row.original.id}`}>Open report</Link>
				</Button>
				{isCompletedAuditReport(row.original) ? (
					<DownloadReportButton
						report={row.original}
						showLabel={false}
					/>
				) : null}
				<DeleteReportButton
					reportId={row.original.id as Id<"auditReports">}
				/>
			</div>
		),
	},
];
