"use client";

import { useReportHistoryDataTable } from "@/components/history/ReportHistoryDataTable/use-report-history-data-table";
import { EmptyState } from "@/components/shared/EmptyState";
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
import type { AuditReport } from "@/lib/types";
import { flexRender } from "@tanstack/react-table";
import { Search } from "lucide-react";

type ReportHistoryDataTableProps = {
	canDeleteReports: boolean;
	data: AuditReport[];
	isMoreDataAvailable: boolean;
	onScrollToBottom?: () => void;
};

export function ReportHistoryDataTable({
	canDeleteReports,
	data,
	isMoreDataAvailable,
	onScrollToBottom,
}: ReportHistoryDataTableProps) {
	const {
		columnCount,
		contentTypeFilter,
		globalFilter,
		rows,
		scrollTriggerIndex,
		scrollTriggerRef,
		setContentTypeFilter,
		setGlobalFilter,
		setVerdictFilter,
		table,
		verdictFilter,
	} = useReportHistoryDataTable({
		canDeleteReports,
		data,
		onScrollToBottom,
	});

	return (
		<div className="space-y-4">
			<div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
				<label className="relative">
					<span className="sr-only">Search by brand or content</span>
					<Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
					<Input
						value={globalFilter}
						onChange={(event) => setGlobalFilter(event.target.value)}
						placeholder="Search by brand or content"
						className="pl-8"
					/>
				</label>

				<Select
					value={verdictFilter}
					onValueChange={setVerdictFilter}
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
					value={contentTypeFilter}
					onValueChange={setContentTypeFilter}
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

			{rows.length ? (
				<div className="overflow-x-auto rounded-lg border bg-card">
					<Table containerClassName="h-[700px]">
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead
											key={header.id}
											className="sticky top-0 z-10 bg-muted ring-1 ring-foreground"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>

						<TableBody>
							{rows.map((row, index) => (
								<TableRow
									key={row.id}
									ref={
										index === scrollTriggerIndex ? scrollTriggerRef : undefined
									}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))}

							{isMoreDataAvailable && (
								<TableRow>
									<TableCell
										colSpan={columnCount}
										className="text-center text-muted-foreground"
									>
										Loading More...
									</TableCell>
								</TableRow>
							)}
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
