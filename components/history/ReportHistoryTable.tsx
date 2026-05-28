"use client";

import { ReportHistoryDataTable } from "@/components/history/ReportHistoryDataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import type { AuditReport } from "@/lib/types";

type ReportHistoryTableProps = {
	canDeleteReports: boolean;
	reports: AuditReport[];
	loading?: boolean;
	isMoreDataAvailable: boolean;
	onScrollToBottom?: () => void;
};
export function ReportHistoryTable({
	canDeleteReports,
	reports,
	loading = false,
	isMoreDataAvailable,
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
			canDeleteReports={canDeleteReports}
			data={reports}
			isMoreDataAvailable={isMoreDataAvailable}
			onScrollToBottom={onScrollToBottom}
		/>
	);
}
