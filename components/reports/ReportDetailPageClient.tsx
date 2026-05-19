"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ReportDetail } from "@/components/reports/ReportDetail";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";

export function ReportDetailPageClient({ reportId }: { reportId: string }) {
  const report = useQuery(api.report.getReportWithFindings, {
    reportId: reportId as Id<"auditReports">,
  });

  if (report === undefined) {
    return <LoadingState label="Loading report" />;
  }

  if (!report) {
    return (
      <EmptyState
        title="Missing report"
        description="Return to report history to open one of the available reports."
        actionHref="/history"
        actionLabel="Back to history"
      />
    );
  }

  return <ReportDetail report={report} />;
}
