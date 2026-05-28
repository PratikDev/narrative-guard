"use client";

import { ReportHistoryTable } from "@/components/history/ReportHistoryTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { useReportHistoryPagination } from "@/hooks/use-report-history-pagination";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { canDeleteReports } from "@/lib/workspace-permissions";

export default function HistoryPage() {
	const { activeMembership } = useWorkspace();
	const pagination = useReportHistoryPagination();

	return (
		<div className="space-y-6">
			<PageHeader
				title="Report History"
				description="Search and filter prior content audits by brand, verdict, content type, and report summary."
			/>

			<ReportHistoryTable
				canDeleteReports={canDeleteReports(activeMembership?.role)}
				onScrollToBottom={
					pagination.canLoadMore && !pagination.isLoadingMore
						? pagination.loadMoreReports
						: undefined
				}
				isMoreDataAvailable={pagination.isLoadingMore || pagination.canLoadMore}
				reports={pagination.results}
				loading={pagination.isLoadingFirstPage}
			/>
		</div>
	);
}
