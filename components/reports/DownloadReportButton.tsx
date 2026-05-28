"use client";

import { Download } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

import { PrintableReport } from "@/components/reports/PrintableReport";
import { Button } from "@/components/ui/button";

import { fontVariableClasses } from "@/lib/fonts";
import type { AuditReport } from "@/lib/types";
import { cn } from "@/lib/utils";

type DownloadReportButtonProps = {
	report: AuditReport;
	showLabel?: boolean;
};

function getReportTitle(report: AuditReport) {
	const safeBrandName = report.brandName
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	const brandSegment = safeBrandName || "brand";

	return `audit-report-${brandSegment}-${report.id}`;
}

const pageStyle = `
	@page {
		size: A4 portrait;
		margin: 1mm;
	}

	@media print {
		body {
			background: var(--background);
			font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}

		[data-printable-report-wrapper] {
			display: block !important;
		}
	}
`;

export function DownloadReportButton({
	report,
	showLabel = true,
}: DownloadReportButtonProps) {
	const reportRef = useRef<HTMLDivElement>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	const handlePrint = useReactToPrint({
		bodyClass: cn("antialiased", fontVariableClasses),
		contentRef: reportRef,
		documentTitle: getReportTitle(report),
		onAfterPrint: () => {
			setIsGenerating(false);
		},
		onBeforePrint: async () => {
			setIsGenerating(true);
		},
		pageStyle,
	});

	return (
		<>
			<Button
				aria-label="Download report PDF"
				disabled={isGenerating}
				onClick={handlePrint}
				size={showLabel ? "default" : "icon-sm"}
				type="button"
				variant="outline"
			>
				<Download data-icon="inline-start" />
				{showLabel ? (isGenerating ? "Generating PDF" : "Download PDF") : null}
			</Button>
			<div
				aria-hidden="true"
				data-printable-report-wrapper
				style={{
					left: "-10000px",
					position: "fixed",
					top: 0,
				}}
			>
				<PrintableReport
					ref={reportRef}
					report={report}
				/>
			</div>
		</>
	);
}
