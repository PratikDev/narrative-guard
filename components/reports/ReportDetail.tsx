import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
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
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" render={<Link href="/history" />}>
          <ArrowLeft className="size-4" />
          Back to history
        </Button>
        <Button render={<Link href="/audit" />}>
          <FileText className="size-4" />
          Run another audit
        </Button>
      </div>

      <Card className="rounded-lg">
        <CardHeader className="gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <CardTitle className="text-xl">{report.brandName}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {CONTENT_TYPE_LABELS[report.contentType]} ·{" "}
              {formatDate(report.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ScoreDisplay score={report.score} size="lg" />
            <StatusBadge verdict={report.verdict} />
          </div>
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
    </div>
  );
}
