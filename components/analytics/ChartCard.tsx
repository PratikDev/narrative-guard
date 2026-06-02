"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

type Props = {
  title: string;
  description?: string;
  isLoading: boolean;
  isEmpty: boolean;
  filterSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function ChartCard({ title, description, isLoading, isEmpty, filterSlot, children, className }: Props) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {filterSlot && <div className="flex shrink-0 items-center gap-2">{filterSlot}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-70 w-full" />
        ) : isEmpty ? (
          <EmptyState
            title="No data"
            description="No audits match the current filters."
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
