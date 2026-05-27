"use client";

import { api } from "@/convex/_generated/api";
import { usePaginatedQuery } from "convex/react";

const REPORTS_PAGE_SIZE = 20;

export function useReportHistoryPagination() {
	const { results, status, loadMore } = usePaginatedQuery(
		api.report.listReports,
		{},
		{
			initialNumItems: REPORTS_PAGE_SIZE,
		}
	);

	const isLoadingFirstPage = status === "LoadingFirstPage";
	const canLoadMore = status === "CanLoadMore";
	const isLoadingMore = status === "LoadingMore";
	const isExhausted = status === "Exhausted";

	const loadMoreReports = () => {
		loadMore(REPORTS_PAGE_SIZE);
	};

	return {
		results,
		loadMoreReports,
		isLoadingFirstPage,
		isLoadingMore,
		isExhausted,
		canLoadMore,
	};
}
