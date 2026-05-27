"use client";

import { api } from "@/convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { useMemo, useState } from "react";

const REPORTS_PAGE_SIZE = 10;

export function useReportHistoryPagination() {
	const { results, status, loadMore } = usePaginatedQuery(
		api.report.listReports,
		{},
		{ initialNumItems: REPORTS_PAGE_SIZE },
	);
	const [pageIndex, setPageIndex] = useState(0);

	const isLoadingFirstPage = status === "LoadingFirstPage";
	const isLoadingMore = status === "LoadingMore";
	const canLoadMore = status === "CanLoadMore";
	const pageCount = Math.max(1, Math.ceil(results.length / REPORTS_PAGE_SIZE));
	const currentPageIndex = Math.min(pageIndex, pageCount - 1);
	const visibleStart = results.length
		? currentPageIndex * REPORTS_PAGE_SIZE + 1
		: 0;
	const visibleEnd = Math.min(
		(currentPageIndex + 1) * REPORTS_PAGE_SIZE,
		results.length,
	);
	const hasLoadedNextPage = visibleEnd < results.length;
	const hasNextPage = hasLoadedNextPage || canLoadMore;
	const visibleReports = useMemo(() => {
		const start = currentPageIndex * REPORTS_PAGE_SIZE;
		return results.slice(start, start + REPORTS_PAGE_SIZE);
	}, [currentPageIndex, results]);

	const goToFirstPage = () => {
		setPageIndex(0);
	};

	const goToPreviousPage = () => {
		setPageIndex(Math.max(0, currentPageIndex - 1));
	};

	const goToNextPage = () => {
		if (hasLoadedNextPage) {
			setPageIndex(currentPageIndex + 1);
			return;
		}

		if (canLoadMore) {
			loadMore(REPORTS_PAGE_SIZE);
			setPageIndex(currentPageIndex + 1);
		}
	};

	return {
		canGoToPreviousPage: currentPageIndex > 0,
		canGoToNextPage: hasNextPage,
		nextPageLabel: hasLoadedNextPage ? "Go to next page" : "Load more reports",
		currentPage: currentPageIndex + 1,
		goToFirstPage,
		goToNextPage,
		goToPreviousPage,
		isLoadingFirstPage,
		isLoadingMore,
		loadedCount: results.length,
		pageCount,
		pageSize: REPORTS_PAGE_SIZE,
		visibleEnd,
		visibleReports,
		visibleStart,
	};
}
