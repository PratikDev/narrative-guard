"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { AnalyticsFilterBar } from "@/components/analytics/AnalyticsFilterBar";
import { AnalyticsSummaryCards } from "@/components/analytics/AnalyticsSummaryCards";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { AuditVolumeChart } from "@/components/analytics/AuditVolumeChart";
import { VerdictDistributionChart } from "@/components/analytics/VerdictDistributionChart";
import { ScoreDimensionRadarChart } from "@/components/analytics/ScoreDimensionRadarChart";
import { IssueTypeBreakdownChart } from "@/components/analytics/IssueTypeBreakdownChart";
import { SeverityBreakdownChart } from "@/components/analytics/SeverityBreakdownChart";
import { ContentTypePerformanceChart } from "@/components/analytics/ContentTypePerformanceChart";
import { BrandComparisonChart } from "@/components/analytics/BrandComparisonChart";
import { MemberActivitySection } from "@/components/analytics/MemberActivitySection";
import { RiskyAuditsTable } from "@/components/analytics/RiskyAuditsTable";
import type { AnalyticsFilters } from "@/lib/analytics-types";

const DEFAULT_FILTERS: AnalyticsFilters = {
  datePreset: "30d",
  brandId: "all",
  contentType: "all",
  memberId: "all",
};

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_FILTERS);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Explore audit trends, score performance, issue patterns, and team activity across all brands."
      />

      <AnalyticsFilterBar filters={filters} onFiltersChange={setFilters} />

      <AnalyticsSummaryCards filters={filters} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ScoreTrendChart filters={filters} />
        <AuditVolumeChart filters={filters} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <VerdictDistributionChart filters={filters} />
        <ScoreDimensionRadarChart filters={filters} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <IssueTypeBreakdownChart filters={filters} />
        <SeverityBreakdownChart filters={filters} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ContentTypePerformanceChart filters={filters} />
        <BrandComparisonChart filters={filters} />
      </div>

      <MemberActivitySection filters={filters} />

      <RiskyAuditsTable filters={filters} />
    </div>
  );
}
