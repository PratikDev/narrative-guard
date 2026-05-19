"use client";

import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { BrandHealthSummary } from "@/components/dashboard/BrandHealthSummary";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentReports } from "@/components/dashboard/RecentReports";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Home() {
  const stats = useQuery(api.report.getDashboardStats);
  const reports = useQuery(api.report.listReports);
  const health = useQuery(api.report.getBrandHealth);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Review audit volume, brand health, and the latest coherence reports across active brands."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/setup">
                <ShieldCheck className="size-4" />
                Create brand
              </Link>
            </Button>
            <Button asChild>
              <Link href="/audit">
                <FileText className="size-4" />
                Run audit
              </Link>
            </Button>
          </>
        }
      />
      <DashboardStats
        stats={
          stats ?? {
            totalReports: 0,
            averageScore: 0,
            needsReviewCount: 0,
            offBrandCount: 0,
            onBrandCount: 0,
          }
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
        <RecentReports reports={reports ?? []} />
        <BrandHealthSummary health={health ?? []} />
      </div>
    </div>
  );
}
