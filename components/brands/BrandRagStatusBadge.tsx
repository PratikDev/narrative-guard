import { Badge } from "@/components/ui/badge";
import {
  BRAND_RAG_STATUS_LABELS,
  getBrandRagStatusClass,
  normalizeBrandRagStatus,
} from "@/lib/brand-status";
import type { BrandRagStatus } from "@/lib/brand-status";

export function BrandRagStatusBadge({ status }: { status: BrandRagStatus }) {
  const normalizedStatus = normalizeBrandRagStatus(status);

  return (
    <Badge variant="outline" className={getBrandRagStatusClass(status)}>
      {BRAND_RAG_STATUS_LABELS[normalizedStatus]}
    </Badge>
  );
}
