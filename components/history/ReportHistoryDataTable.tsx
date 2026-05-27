"use client";

import { reportHistoryColumns } from "@/components/history/ReportHistoryColumns";
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
import type { AuditReport, ContentType, Verdict } from "@/lib/types";
import {
	type ColumnFiltersState,
	type FilterFn,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useState } from "react";

type ReportHistoryDataTableProps = {
	data: AuditReport[];
	onScrollToBottom?: (numItems: number) => void;
};

const reportSearchFilter: FilterFn<AuditReport> = (row, _columnId, value) => {
	const query = String(value).trim().toLowerCase();

	if (!query) return true;

	const report = row.original;
	return (
		report.brandName.toLowerCase().includes(query) ||
		report.originalContent.toLowerCase().includes(query) ||
		report.summary.toLowerCase().includes(query)
	);
};

export function ReportHistoryDataTable({
	data,
	onScrollToBottom,
}: ReportHistoryDataTableProps) {
	const [globalFilter, setGlobalFilter] = useState("");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const table = useReactTable({
		data,
		columns: reportHistoryColumns,
		globalFilterFn: reportSearchFilter,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			columnFilters,
			globalFilter,
		},
	});
	const verdictFilter =
		(table.getColumn("verdict")?.getFilterValue() as Verdict | undefined) ??
		"all";
	const contentTypeFilter =
		(table.getColumn("contentType")?.getFilterValue() as
			| ContentType
			| undefined) ?? "all";

	return (
		<div className="space-y-4">
			<div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
				<label className="relative">
					<span className="sr-only">Search by brand or content</span>
					<Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
					<Input
						value={globalFilter}
						onChange={(event) => table.setGlobalFilter(event.target.value)}
						placeholder="Search by brand or content"
						className="pl-8"
					/>
				</label>

				<Select
					value={verdictFilter}
					onValueChange={(value) => {
						table
							.getColumn("verdict")
							?.setFilterValue(value === "all" ? undefined : value);
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
					value={contentTypeFilter}
					onValueChange={(value) => {
						table
							.getColumn("contentType")
							?.setFilterValue(value === "all" ? undefined : value);
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

			{table.getRowModel().rows.length ? (
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
							{table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
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
