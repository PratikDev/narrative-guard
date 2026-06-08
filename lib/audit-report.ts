import type { AuditReport } from "@/lib/types";

export function isCompletedAuditReport(report: AuditReport) {
  return report.status === "complete";
}

export function isFailedAuditReport(report: AuditReport) {
  return report.status === "failed";
}
