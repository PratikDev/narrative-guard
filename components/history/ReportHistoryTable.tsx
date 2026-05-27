"use client";

import { ReportHistoryDataTable } from "@/components/history/ReportHistoryDataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import type { AuditReport } from "@/lib/types";

type ReportHistoryTableProps = {
	reports: AuditReport[];
	loading?: boolean;
	onScrollToBottom?: (numItems: number) => void;
};
export function ReportHistoryTable({
	reports,
	loading = false,
	onScrollToBottom,
}: ReportHistoryTableProps) {
	if (loading) {
		return <LoadingState label="Loading report history" />;
	}

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
		<ReportHistoryDataTable
			data={reports}
			onScrollToBottom={onScrollToBottom}
		/>
	);
}
