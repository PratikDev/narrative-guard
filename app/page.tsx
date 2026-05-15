import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandHealthSummary } from "@/components/dashboard/BrandHealthSummary";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentReports } from "@/components/dashboard/RecentReports";
import { PageHeader } from "@/components/shared/PageHeader";
import { dashboardStats, mockReports } from "@/lib/mock-data";

export default function Home() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Review audit volume, brand health, and the latest coherence reports across active brands."
        actions={
          <>
            <Button variant="outline" render={<Link href="/setup" />}>
              <ShieldCheck className="size-4" />
              Create brand
            </Button>
            <Button render={<Link href="/audit" />}>
              <FileText className="size-4" />
              Run audit
            </Button>
          </>
        }
      />
      <DashboardStats stats={dashboardStats} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
        <RecentReports reports={mockReports} />
        <BrandHealthSummary />
      </div>
    </div>
  );
}
