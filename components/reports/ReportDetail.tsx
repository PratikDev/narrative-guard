import Link from "next/link";
import { AlertCircle, ArrowLeft, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DimensionScores } from "@/components/audit/DimensionScores";
import { FlaggedSentenceList } from "@/components/audit/FlaggedSentenceList";
import { OriginalRewriteComparison } from "@/components/audit/OriginalRewriteComparison";
import { RewritePanel } from "@/components/audit/RewritePanel";
import { ScoreDisplay } from "@/components/shared/ScoreDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { AuditReport } from "@/lib/types";

export function ReportDetail({ report }: { report: AuditReport }) {
  const isProcessing = report.status === "processing";
  const isFailed = report.status === "failed";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link href="/history">
            <ArrowLeft className="size-4" />
            Back to history
          </Link>
        </Button>
        <Button asChild>
          <Link href="/audit">
            <FileText className="size-4" />
            Run another audit
          </Link>
        </Button>
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

      <Card className="rounded-lg">
        <CardHeader className="gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <CardTitle className="text-xl">{report.brandName}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {CONTENT_TYPE_LABELS[report.contentType]} ·{" "}
              {formatDate(report.createdAt)}
            </p>
          </div>
          {!isProcessing && !isFailed ? (
            <div className="flex flex-wrap items-center gap-3">
              <ScoreDisplay score={report.score} size="lg" />
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

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Submitted content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
            {report.originalContent}
          </p>
        </CardContent>
      </Card>

      {!isProcessing && !isFailed ? (
        <>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Score breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <DimensionScores scores={report.dimensionScores} />
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
              <CardTitle>Rewrite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <RewritePanel rewrite={report.rewriteSuggestion} />
              <Separator />
              <OriginalRewriteComparison
                original={report.originalContent}
                rewrite={report.rewriteSuggestion}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
