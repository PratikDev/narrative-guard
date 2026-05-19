import { ReportDetailPageClient } from "@/components/reports/ReportDetailPageClient";
import { PageHeader } from "@/components/shared/PageHeader";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Detail"
        description="Review the submitted content, scoring breakdown, flagged sentences, and suggested rewrite."
      />
      <ReportDetailPageClient reportId={reportId} />
    </div>
  );
}
