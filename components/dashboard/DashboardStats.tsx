import { MetricCard } from "@/components/shared/MetricCard";
import type { DashboardStats as DashboardStatsType } from "@/lib/types";

export function DashboardStats({ stats }: { stats: DashboardStatsType }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard label="Total audits" value={stats.totalReports} helper="Saved reports" />
      <MetricCard label="Average score" value={stats.averageScore} helper="Across all brands" />
      <MetricCard
        label="Needs review"
        value={stats.needsReviewCount}
        helper="Human edits recommended"
      />
      <MetricCard
        label="Off-brand"
        value={stats.offBrandCount}
        helper="High-priority review"
      />
    </div>
  );
}
