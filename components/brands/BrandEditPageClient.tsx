"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { BrandSetupForm } from "@/components/brands/BrandSetupForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";

export function BrandEditPageClient({ brandId }: { brandId: string }) {
  const brand = useQuery(api.brand.getBrand, {
    brandId: brandId as Id<"brands">,
  });

  if (brand === undefined) {
    return <LoadingState label="Loading brand" />;
  }

  if (!brand) {
    return (
      <EmptyState
        title="Brand not found"
        description="Return to setup to choose one of the saved brands."
        actionHref="/setup"
        actionLabel="Back to setup"
      />
    );
  }

  return <BrandSetupForm brand={brand} />;
}
