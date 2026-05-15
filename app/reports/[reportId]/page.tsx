import { ReportDetail } from "@/components/reports/ReportDetail";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { getReportById } from "@/lib/mock-data";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = getReportById(reportId);

  if (!report) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Report not found"
          description="The requested mock report ID does not exist in the demo dataset."
        />
        <EmptyState
          title="Missing report"
          description="Return to report history to open one of the available demo reports."
          actionHref="/history"
          actionLabel="Back to history"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Detail"
        description="Review the submitted content, scoring breakdown, flagged sentences, and suggested rewrite."
      />
      <ReportDetail report={report} />
    </div>
  );
}
