import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScoreDisplay } from "@/components/shared/ScoreDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DimensionScores } from "./DimensionScores";
import { FlaggedSentenceList } from "./FlaggedSentenceList";
import { OriginalRewriteComparison } from "./OriginalRewriteComparison";
import { RewritePanel } from "./RewritePanel";
import type { AuditReport } from "@/lib/types";

export function AuditResult({ report }: { report: AuditReport }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <CardTitle>Current report result</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {report.summary}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ScoreDisplay score={report.score} size="lg" />
          <StatusBadge verdict={report.verdict} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Separator />
        <section>
          <h2 className="mb-4 text-sm font-medium">Dimension score breakdown</h2>
          <DimensionScores
            contentType={report.contentType}
            scores={report.dimensionScores}
          />
        </section>
        <section>
          <h2 className="mb-3 text-sm font-medium">Flagged sentences and reasons</h2>
          <FlaggedSentenceList flags={report.flaggedSentences} />
        </section>
        <RewritePanel rewrite={report.rewriteSuggestion} />
        <section>
          <h2 className="mb-3 text-sm font-medium">Original vs rewritten content</h2>
          <OriginalRewriteComparison
            original={report.originalContent}
            rewrite={report.rewriteSuggestion}
          />
        </section>
      </CardContent>
    </Card>
  );
}
