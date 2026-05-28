import { DimensionScores } from "@/components/audit/DimensionScores";
import { FlaggedSentenceList } from "@/components/audit/FlaggedSentenceList";
import { ScoreDisplay } from "@/components/shared/ScoreDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { AuditReport } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { RefObject } from "react";

function getReportDetailsBorderClass(verdict: AuditReport["verdict"]) {
	if (verdict === "on_brand") {
		return "border-success";
	}

	if (verdict === "needs_review") {
		return "border-warning";
	}

	return "border-error";
}

function PrintableRewriteComparison({
	original,
	rewrite,
}: {
	original: string;
	rewrite: string;
}) {
	return (
		<div className="grid gap-4 grid-cols-2">
			<section className="rounded-lg border bg-background p-4">
				<h3 className="text-sm font-medium">Original</h3>
				<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
					{original}
				</p>
			</section>

			<section className="rounded-lg border border-success/30 bg-success/5 p-4">
				<h3 className="text-sm font-medium">Rewritten</h3>
				<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
					{rewrite}
				</p>
			</section>
		</div>
	);
}

export function PrintableReport({
	report,
	ref,
}: {
	report: AuditReport;
	ref: RefObject<HTMLDivElement | null>;
}) {
	return (
		<article
			ref={ref}
			className="bg-background p-8 text-foreground print:w-full print:p-6"
		>
			<div className="flex flex-col gap-6">
				<Card
					className={cn(
						"rounded-lg",
						getReportDetailsBorderClass(report.verdict),
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
						<div className="flex flex-wrap items-center gap-3">
							<ScoreDisplay
								score={report.score}
								size="lg"
							/>
							<StatusBadge verdict={report.verdict} />
						</div>
					</CardHeader>
					<CardContent>
						<p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
							{report.summary}
						</p>
					</CardContent>
				</Card>

				<Card className="rounded-lg">
					<CardHeader>
						<CardTitle>Rewrite</CardTitle>
					</CardHeader>
					<CardContent>
						<PrintableRewriteComparison
							original={report.originalContent}
							rewrite={report.rewriteSuggestion}
						/>
					</CardContent>
				</Card>

				<Card className="rounded-lg">
					<CardHeader>
						<CardTitle>Findings</CardTitle>
					</CardHeader>
					<CardContent>
						<FlaggedSentenceList flags={report.flaggedSentences} />
					</CardContent>
				</Card>

				<Card className="rounded-lg">
					<CardHeader>
						<CardTitle>Score breakdown</CardTitle>
					</CardHeader>
					<CardContent>
						<DimensionScores
							contentType={report.contentType}
							scores={report.dimensionScores}
						/>
					</CardContent>
				</Card>
			</div>
		</article>
	);
}
