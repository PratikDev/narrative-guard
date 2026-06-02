"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CONTENT_TYPE_LABELS, CONTENT_TYPES } from "@/lib/constants";
import type { AnalyticsFilters, DateRangePreset } from "@/lib/analytics-types";
import type { ContentType } from "@/lib/types";
import type { Id } from "@/convex/_generated/dataModel";

type Props = {
  filters: AnalyticsFilters;
  onFiltersChange: (f: AnalyticsFilters) => void;
};

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

export function AnalyticsFilterBar({ filters, onFiltersChange }: Props) {
  const { workspaceId } = useWorkspace();
  const brands = useQuery(api.brand.listBrands, workspaceId ? { workspaceId } : "skip") ?? [];
  const members = useQuery(api.workspace.listMembers, workspaceId ? { workspaceId } : "skip") ?? [];

  function update<K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap gap-3 rounded-xl border bg-card p-4">
      <Select value={filters.datePreset} onValueChange={(v) => update("datePreset", v as DateRangePreset)}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          {DATE_PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.brandId} onValueChange={(v) => update("brandId", v as Id<"brands"> | "all")}>
        <SelectTrigger className="w-full sm:w-45">
          <SelectValue placeholder="All brands" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All brands</SelectItem>
          {brands.map((b) => (
            <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.contentType} onValueChange={(v) => update("contentType", v as ContentType | "all")}>
        <SelectTrigger className="w-full sm:w-45">
          <SelectValue placeholder="All content types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All content types</SelectItem>
          {CONTENT_TYPES.map((ct) => (
            <SelectItem key={ct} value={ct}>{CONTENT_TYPE_LABELS[ct]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.memberId} onValueChange={(v) => update("memberId", v as Id<"users"> | "all")}>
        <SelectTrigger className="w-full sm:w-45">
          <SelectValue placeholder="All members" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All members</SelectItem>
          {members.map(({ member, user }) => (
            <SelectItem key={member.userId} value={member.userId}>
              {user?.name ?? user?.email ?? "Unknown"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
