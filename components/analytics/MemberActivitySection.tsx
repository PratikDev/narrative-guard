"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ChartCard } from "./ChartCard";
import { filtersToQueryArgs } from "@/lib/analytics-utils";
import { formatDate } from "@/lib/format";
import type { AnalyticsFilters } from "@/lib/analytics-types";

type Props = { filters: AnalyticsFilters };

const chartConfig = {
  auditCount: { label: "Audits", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export function MemberActivitySection({ filters }: Props) {
  const { workspaceId } = useWorkspace();
  const { fromTs, toTs, brandId, contentType } = filtersToQueryArgs(filters, workspaceId);
  const data = useQuery(api.analytics.getMemberActivity, { workspaceId, fromTs, toTs, brandId, contentType });

  const chartData = data?.map((m) => ({
    name: m.name ?? m.email ?? "Unknown",
    auditCount: m.auditCount,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <ChartCard
        title="Member Audit Count"
        description="Audits run per team member."
        isLoading={data === undefined}
        isEmpty={data?.length === 0}
      >
        <ChartContainer config={chartConfig} className="h-70 w-full">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={100} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="auditCount" fill="var(--color-auditCount)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </ChartCard>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Member Details</CardTitle>
        </CardHeader>
        <CardContent>
          {data === undefined ? (
            <Skeleton className="h-60 w-full" />
          ) : data.length === 0 ? (
            <EmptyState title="No activity" description="No audits found for the current filters." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-right">Audits</TableHead>
                  <TableHead className="text-right">Avg Score</TableHead>
                  <TableHead className="text-right">Off Brand</TableHead>
                  <TableHead className="text-right">Last Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((member) => (
                  <TableRow key={member.userId}>
                    <TableCell>
                      <div className="font-medium">{member.name ?? "Unknown"}</div>
                      {member.email && <div className="text-xs text-muted-foreground">{member.email}</div>}
                    </TableCell>
                    <TableCell className="text-right">{member.auditCount}</TableCell>
                    <TableCell className="text-right">{member.avgScore}</TableCell>
                    <TableCell className="text-right">{member.offBrandCount}</TableCell>
                    <TableCell className="text-right">
                      {member.lastAuditAt ? formatDate(member.lastAuditAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
