"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReportHistoryTable } from "@/components/history/ReportHistoryTable";
import { PageHeader } from "@/components/shared/PageHeader";

export default function HistoryPage() {
  const reports = useQuery(api.report.listReports);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report History"
        description="Search and filter prior content audits by brand, verdict, content type, and report summary."
      />
      <ReportHistoryTable reports={reports ?? []} loading={reports === undefined} />
    </div>
  );
}
