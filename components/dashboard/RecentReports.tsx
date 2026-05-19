import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScoreDisplay } from "@/components/shared/ScoreDisplay";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { AuditReport } from "@/lib/types";

export function RecentReports({ reports }: { reports: AuditReport[] }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Recent reports</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[720px] divide-y">
          {reports.slice(0, 5).map((report) => (
            <div
              key={report.id}
              className="grid grid-cols-[1.2fr_1fr_0.7fr_1fr_0.8fr_auto] items-center gap-4 py-3 text-sm"
            >
              <span className="font-medium">{report.brandName}</span>
              <span className="text-muted-foreground">
                {CONTENT_TYPE_LABELS[report.contentType]}
              </span>
              <ScoreDisplay score={report.score} size="sm" />
              <StatusBadge verdict={report.verdict} />
              <span className="text-muted-foreground">
                {formatDate(report.createdAt)}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/reports/${report.id}`}>
                  Open
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
