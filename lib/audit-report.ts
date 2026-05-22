import type { AuditReport } from "@/lib/types";

export function isCompletedAuditReport(report: AuditReport) {
  return report.status === "complete";
}
