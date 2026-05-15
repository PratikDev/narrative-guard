import { ReportHistoryTable } from "@/components/history/ReportHistoryTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockReports } from "@/lib/mock-data";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Report History"
        description="Search and filter prior content audits by brand, verdict, content type, and report summary."
      />
      <ReportHistoryTable reports={mockReports} />
    </div>
  );
}
