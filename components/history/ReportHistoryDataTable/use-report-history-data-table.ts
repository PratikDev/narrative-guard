"use client";

import { getReportHistoryColumns } from "@/components/history/ReportHistoryColumns";
import { useInViewport } from "@/hooks/use-in-viewport";
import type { AuditReport, ContentType, Verdict } from "@/lib/types";
import {
	type ColumnFiltersState,
	type FilterFn,
	getCoreRowModel,
	getFilteredRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";

type UseReportHistoryDataTableOptions = {
	canDeleteReports: boolean;
	data: AuditReport[];
	onScrollToBottom?: () => void;
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

export function useReportHistoryDataTable({
	canDeleteReports,
	data,
	onScrollToBottom,
}: UseReportHistoryDataTableOptions) {
	const [globalFilter, setGlobalFilter] = useState("");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const lastTriggeredRowIdRef = useRef<string | null>(null);
	const { ref: scrollTriggerRef, inViewport } =
		useInViewport<HTMLTableRowElement>();
	const reportHistoryColumns = getReportHistoryColumns({ canDeleteReports });

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
	const rows = table.getRowModel().rows;
	const scrollTriggerIndex = Math.max(rows.length - 3, 0);
	const scrollTriggerRowId = rows[scrollTriggerIndex]?.id;
	const verdictFilter =
		(table.getColumn("verdict")?.getFilterValue() as Verdict | undefined) ??
		"all";
	const contentTypeFilter =
		(table.getColumn("contentType")?.getFilterValue() as
			| ContentType
			| undefined) ?? "all";

	useEffect(() => {
		if (!inViewport || !onScrollToBottom || !scrollTriggerRowId) return;
		if (lastTriggeredRowIdRef.current === scrollTriggerRowId) return;

		lastTriggeredRowIdRef.current = scrollTriggerRowId;
		onScrollToBottom();
	}, [inViewport, onScrollToBottom, scrollTriggerRowId]);

	const setVerdictFilter = (value: string) => {
		table.getColumn("verdict")?.setFilterValue(value === "all" ? undefined : value);
	};

	const setContentTypeFilter = (value: string) => {
		table
			.getColumn("contentType")
			?.setFilterValue(value === "all" ? undefined : value);
	};

	return {
		columnCount: reportHistoryColumns.length,
		contentTypeFilter,
		globalFilter,
		rows,
		scrollTriggerIndex,
		scrollTriggerRef,
		setContentTypeFilter,
		setGlobalFilter: table.setGlobalFilter,
		setVerdictFilter,
		table,
		verdictFilter,
	};
}
