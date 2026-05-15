import { Progress } from "@/components/ui/progress";
import { SCORE_DIMENSION_LABELS, SCORE_DIMENSIONS } from "@/lib/constants";
import type { DimensionScores as DimensionScoresType } from "@/lib/types";

export function DimensionScores({ scores }: { scores: DimensionScoresType }) {
  return (
    <div className="space-y-4">
      {SCORE_DIMENSIONS.map((dimension) => (
        <div key={dimension} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">{SCORE_DIMENSION_LABELS[dimension]}</span>
            <span className="tabular-nums text-muted-foreground">
              {scores[dimension]}
            </span>
          </div>
          <Progress value={scores[dimension]} />
        </div>
      ))}
    </div>
  );
}
