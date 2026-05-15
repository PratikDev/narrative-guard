import { cn } from "@/lib/utils";
import { getScoreTone } from "@/lib/score";

export function ScoreDisplay({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span
        className={cn(
          "font-semibold tabular-nums",
          getScoreTone(score),
          size === "lg" && "text-5xl",
          size === "md" && "text-3xl",
          size === "sm" && "text-xl"
        )}
      >
        {score}
      </span>
      <span className="text-sm text-muted-foreground">/100</span>
    </div>
  );
}
