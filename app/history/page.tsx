"use client";

import { ReportHistoryTable } from "@/components/history/ReportHistoryTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { useReportHistoryPagination } from "@/hooks/use-report-history-pagination";

export default function HistoryPage() {
	const pagination = useReportHistoryPagination();

	return (
		<div className="space-y-6">
			<PageHeader
				title="Report History"
				description="Search and filter prior content audits by brand, verdict, content type, and report summary."
			/>

			<ReportHistoryTable
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
