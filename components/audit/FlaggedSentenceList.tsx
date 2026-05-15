import { Badge } from "@/components/ui/badge";
import { getSeverityClass } from "@/lib/score";
import type { FlaggedSentence } from "@/lib/types";

export function FlaggedSentenceList({
  flags,
}: {
  flags: FlaggedSentence[];
}) {
  if (!flags.length) {
    return (
      <p className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-muted-foreground">
        No flagged sentences. The submitted content follows the active brand
        guidance closely.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <div
          key={flag.id}
          className={`rounded-lg border p-4 ${getSeverityClass(flag.severity)}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="max-w-3xl text-sm font-medium leading-6">
              &quot;{flag.sentence}&quot;
            </p>
            <Badge variant="outline" className="capitalize">
              {flag.severity}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {flag.reason}
          </p>
        </div>
      ))}
    </div>
  );
}
