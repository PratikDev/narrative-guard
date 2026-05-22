import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { AuditReport } from "@/lib/types";

export function AuditReportStatusBadge({ report }: { report: AuditReport }) {
  if (report.status === "processing") {
    return <Badge variant="outline">Processing</Badge>;
  }

  if (report.status === "failed") {
    return (
      <Badge variant="outline" className="border-destructive/40 text-destructive">
        Failed
      </Badge>
    );
  }

  return <StatusBadge verdict={report.verdict} />;
}
