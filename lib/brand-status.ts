import type { Doc } from "@/convex/_generated/dataModel";

export type BrandRagStatus = Doc<"brands">["ragStatus"];

export type NormalizedBrandRagStatus = NonNullable<BrandRagStatus>;

export const BRAND_RAG_STATUS_LABELS: Record<NormalizedBrandRagStatus, string> = {
  not_indexed: "Not indexed",
  indexing: "Indexing",
  ready: "Ready",
  failed: "Failed",
};

export function normalizeBrandRagStatus(
  status: BrandRagStatus
): NormalizedBrandRagStatus {
  return status ?? "not_indexed";
}

export function getBrandRagStatusClass(status: BrandRagStatus) {
  const normalizedStatus = normalizeBrandRagStatus(status);

  if (normalizedStatus === "ready") {
    return "border-primary/40 bg-primary/10 text-primary";
  }
  if (normalizedStatus === "failed") {
    return "border-destructive/40 text-destructive";
  }
  if (normalizedStatus === "indexing") {
    return "border-amber-500/40 text-amber-600";
  }

  return "text-muted-foreground";
}
