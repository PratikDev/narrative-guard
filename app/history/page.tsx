"use client";

import { ReportHistoryTable } from "@/components/history/ReportHistoryTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useReportHistoryPagination } from "@/hooks/use-report-history-pagination";
import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react";

export default function HistoryPage() {
	const pagination = useReportHistoryPagination();

	return (
		<div className="space-y-6">
			<PageHeader
				title="Report History"
				description="Search and filter prior content audits by brand, verdict, content type, and report summary."
			/>

			<ReportHistoryTable
				reports={pagination.visibleReports}
				loading={pagination.isLoadingFirstPage}
			/>
			{!pagination.isLoadingFirstPage && pagination.loadedCount > 0 ? (
				<div className="flex flex-col gap-3 px-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex-1 text-sm text-muted-foreground">
						{pagination.isLoadingMore
							? "Loading more reports..."
							: `Showing ${pagination.visibleStart}-${pagination.visibleEnd} of ${pagination.loadedCount} loaded reports`}
					</div>
					<div className="flex w-full items-center gap-8 lg:w-fit">
						<div className="flex w-fit items-center justify-center text-sm font-medium">
							Page {pagination.currentPage} of {pagination.pageCount}
						</div>
						<div className="ml-auto flex items-center gap-2 lg:ml-0">
							<Button
								type="button"
								variant="outline"
								className="hidden size-8 p-0 lg:flex"
								size="icon"
								onClick={pagination.goToFirstPage}
								disabled={
									!pagination.canGoToPreviousPage || pagination.isLoadingMore
								}
							>
								<span className="sr-only">Go to first page</span>
								<ChevronsLeft />
							</Button>
							<Button
								type="button"
								variant="outline"
								className="size-8"
								size="icon"
								onClick={pagination.goToPreviousPage}
								disabled={
									!pagination.canGoToPreviousPage || pagination.isLoadingMore
								}
							>
								<span className="sr-only">Go to previous page</span>
								<ChevronLeft />
							</Button>
							<Button
								type="button"
								variant="outline"
								className="size-8"
								size="icon"
								onClick={pagination.goToNextPage}
								disabled={!pagination.canGoToNextPage || pagination.isLoadingMore}
							>
								<span className="sr-only">
									{pagination.isLoadingMore
										? "Loading more reports"
										: pagination.nextPageLabel}
								</span>
								<ChevronRight />
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
