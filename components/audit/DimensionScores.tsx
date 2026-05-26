import { Progress } from "@/components/ui/progress";
import {
  SCORE_DIMENSION_DESCRIPTIONS,
  SCORE_DIMENSION_LABELS,
  SCORE_DIMENSION_WEIGHTS,
  SCORE_DIMENSIONS,
} from "@/lib/constants";
import type { DimensionScores as DimensionScoresType } from "@/lib/types";
import { cn } from "@/lib/utils";

function getDimensionTone(score: number) {
  if (score < 70) {
    return {
      label: "Needs attention",
      className: "border-error/30 bg-error/5 text-error",
      progressClassName: "[&>div]:bg-error",
    };
  }

  if (score < 85) {
    return {
      label: "Review",
      className: "border-warning/30 bg-warning/5 text-warning",
      progressClassName: "[&>div]:bg-warning",
    };
  }

  return {
    label: "Strong",
    className: "border-success/30 bg-success/5 text-success",
    progressClassName: "[&>div]:bg-success",
  };
}

export function DimensionScores({ scores }: { scores: DimensionScoresType }) {
  return (
    <div className="space-y-3">
      {SCORE_DIMENSIONS.map((dimension) => {
        const score = scores[dimension];
        const tone = getDimensionTone(score);

        return (
          <div
            key={dimension}
            className="rounded-lg border bg-background p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-medium">
                    {SCORE_DIMENSION_LABELS[dimension]}
                  </h4>
                  <span className="rounded border px-1.5 py-0.5 text-xs text-muted-foreground">
                    {SCORE_DIMENSION_WEIGHTS[dimension]}% weight
                  </span>
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-xs font-medium",
                      tone.className,
                    )}
                  >
                    {tone.label}
                  </span>
                </div>
                <p className="text-sm leading-5 text-muted-foreground">
                  {SCORE_DIMENSION_DESCRIPTIONS[dimension]}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-2xl font-semibold tabular-nums leading-none">
                  {score}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">/100</div>
              </div>
            </div>
            <Progress
              value={score}
              className={cn("mt-4", tone.progressClassName)}
            />
          </div>
        );
      })}
    </div>
  );
}
