import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuditReportStatusBadge } from "@/components/shared/AuditReportStatusBadge";
import { ScoreDisplay } from "@/components/shared/ScoreDisplay";
import { isCompletedAuditReport } from "@/lib/audit-report";
import type { AuditReport } from "@/lib/types";

type BrandHealthItem = {
  brand: {
    id: string;
    name: string;
  };
  averageScore: number;
  latestReport: AuditReport | null;
  reportCount: number;
};

export function BrandHealthSummary({
  health,
  canManageBrands,
}: {
  health: BrandHealthItem[];
  canManageBrands: boolean;
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Brand health summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {health.map(({ brand, averageScore, latestReport, reportCount }) => (
          <div
            key={brand.id}
            className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <h3 className="font-medium">{brand.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {reportCount} reports reviewed
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {latestReport && isCompletedAuditReport(latestReport) ? (
                <ScoreDisplay score={averageScore} size="sm" />
              ) : null}
              {latestReport ? <AuditReportStatusBadge report={latestReport} /> : null}
              {latestReport ? (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/reports/${latestReport.id}`}>Latest report</Link>
                </Button>
              ) : null}
              {canManageBrands ? (
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/setup/${brand.id}`} aria-label={`Edit ${brand.name}`}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
