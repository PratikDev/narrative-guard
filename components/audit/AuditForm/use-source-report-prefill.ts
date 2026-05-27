"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { ContentType } from "@/lib/types";
import { useConvex } from "convex/react";
import { useEffect, useRef, useState } from "react";

type SourceReportPrefillStatus = "idle" | "loading" | "failed";

type SourceReportPrefill = {
	brandId: Id<"brands">;
	contentType: ContentType;
	rewriteSuggestion: string;
};

export function useSourceReportPrefill({
	sourceReportId,
	onPrefill,
}: {
	sourceReportId?: string;
	onPrefill: (sourceReport: SourceReportPrefill) => void;
}) {
	const convex = useConvex();
	const [status, setStatus] = useState<SourceReportPrefillStatus>(
		sourceReportId ? "loading" : "idle",
	);
	const [message, setMessage] = useState("");
	const prefilledSourceReportId = useRef<string | null>(null);

	useEffect(() => {
		if (!sourceReportId || prefilledSourceReportId.current === sourceReportId) {
			return;
		}

		const reportId = sourceReportId;
		let isCurrent = true;

		async function loadSourceReport() {
			await Promise.resolve();

			if (!isCurrent) {
				return;
			}

			setStatus("loading");
			setMessage("");

			try {
				const sourceReport = await convex.query(api.report.getReportWithFindings, {
					reportId: reportId as Id<"auditReports">,
				});

				if (!isCurrent) {
					return;
				}

				prefilledSourceReportId.current = reportId;

				if (!sourceReport) {
					setStatus("failed");
					setMessage(
						"The source report could not be found. You can still start a new audit.",
					);
					return;
				}

				onPrefill({
					brandId: sourceReport.brandId as Id<"brands">,
					contentType: sourceReport.contentType,
					rewriteSuggestion: sourceReport.rewriteSuggestion,
				});
				setStatus("idle");
			} catch {
				if (!isCurrent) {
					return;
				}

				prefilledSourceReportId.current = reportId;
				setStatus("failed");
				setMessage(
					"The source report could not be loaded. You can still start a new audit.",
				);
			}
		}

		void loadSourceReport();

		return () => {
			isCurrent = false;
		};
	}, [convex, onPrefill, sourceReportId]);

	return { status, message };
}
