import { AlertCircle, FileText } from "lucide-react";
import Link from "next/link";

import { DimensionScores } from "@/components/audit/DimensionScores";
import { FlaggedSentenceList } from "@/components/audit/FlaggedSentenceList";
import { OriginalRewriteComparison } from "@/components/audit/OriginalRewriteComparison";
import { DeleteReportButton } from "@/components/reports/DeleteReportButton";
import BackButton from "@/components/shared/BackButton";
import { ScoreDisplay } from "@/components/shared/ScoreDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Id } from "@/convex/_generated/dataModel";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { AuditReport } from "@/lib/types";
import { cn } from "@/lib/utils";

function getBrandDetailsBorderClass(verdict: AuditReport["verdict"]) {
	if (verdict === "on_brand") {
		return "border-success";
	}

	if (verdict === "needs_review") {
		return "border-warning";
	}

	return "border-error";
}

export function ReportDetail({ report }: { report: AuditReport }) {
	const isProcessing = report.status === "processing";
	const isFailed = report.status === "failed";
	const hasCompletedAudit = !isProcessing && !isFailed;

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-wrap gap-2">
					<BackButton />
					<Button asChild>
						<Link
							href={`/audit?sourceReportId=${encodeURIComponent(report.id)}`}
						>
							<FileText className="size-4" />
							Re-audit
						</Link>
					</Button>
				</div>
				<DeleteReportButton
					reportId={report.id as Id<"auditReports">}
					redirectTo="/history"
					showLabel
				/>
			</div>

			{isProcessing ? (
				<Alert>
					<FileText className="size-4" />
					<AlertTitle>Audit processing</AlertTitle>
					<AlertDescription>
						The report has been created. AI scoring and findings will appear
						here when processing completes.
					</AlertDescription>
				</Alert>
			) : null}

			{isFailed ? (
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertTitle>Audit failed</AlertTitle>
					<AlertDescription>
						{report.error ?? "The audit failed before scoring completed."}
					</AlertDescription>
				</Alert>
			) : null}

			{/* Report Summary */}
			<Card
				className={cn(
					"rounded-lg",
					hasCompletedAudit ? getBrandDetailsBorderClass(report.verdict) : null,
				)}
			>
				<CardHeader className="gap-4 sm:grid-cols-[1fr_auto]">
					<div>
						<CardTitle className="text-xl">{report.brandName}</CardTitle>
						<p className="mt-2 text-sm text-muted-foreground">
							{CONTENT_TYPE_LABELS[report.contentType]} ·{" "}
							{formatDate(report.createdAt)}
						</p>
					</div>
					{hasCompletedAudit ? (
						<div className="flex flex-wrap items-center gap-3">
							<ScoreDisplay
								score={report.score}
								size="lg"
							/>
							<StatusBadge verdict={report.verdict} />
						</div>
					) : null}
				</CardHeader>
				<CardContent>
					<p className="text-sm leading-6 text-muted-foreground">
						{report.summary}
					</p>
				</CardContent>
			</Card>

			{hasCompletedAudit ? (
				<>
					<Card className="rounded-lg">
						<CardHeader>
							<CardTitle>Rewrite</CardTitle>
						</CardHeader>
						<CardContent>
							<OriginalRewriteComparison
								original={report.originalContent}
								rewrite={report.rewriteSuggestion}
							/>
						</CardContent>
					</Card>

					<Card className="rounded-lg">
						<Accordion
							type="single"
							collapsible
						>
							<AccordionItem
								value="findings"
								className="border-b-0"
							>
								<CardHeader>
									<AccordionTrigger className="py-0 hover:no-underline">
										<CardTitle>Findings</CardTitle>
									</AccordionTrigger>
								</CardHeader>
								<AccordionContent className="px-6 pt-6">
									<FlaggedSentenceList flags={report.flaggedSentences} />
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</Card>

					<Card className="rounded-lg">
						<Accordion
							type="single"
							collapsible
						>
							<AccordionItem
								value="score-breakdown"
								className="border-b-0"
							>
								<CardHeader>
									<AccordionTrigger className="py-0 hover:no-underline">
										<CardTitle>Score breakdown</CardTitle>
									</AccordionTrigger>
								</CardHeader>
								<AccordionContent className="px-6 pt-6">
									<DimensionScores
										contentType={report.contentType}
										scores={report.dimensionScores}
									/>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</Card>
				</>
			) : null}
		</div>
	);
}
