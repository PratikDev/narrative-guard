import { Badge } from "@/components/ui/badge";
import { VERDICT_LABELS } from "@/lib/constants";
import { getVerdictBadgeClass } from "@/lib/score";
import type { Verdict } from "@/lib/types";

export function StatusBadge({ verdict }: { verdict: Verdict }) {
  return (
    <Badge variant="outline" className={getVerdictBadgeClass(verdict)}>
      {VERDICT_LABELS[verdict]}
    </Badge>
  );
}
