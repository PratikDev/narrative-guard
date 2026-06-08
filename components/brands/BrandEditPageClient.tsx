"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { BrandVersionHistory } from "@/components/brands/BrandVersionHistory";
import { BrandSetupForm } from "@/components/brands/BrandSetupForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { canManageBrands } from "@/lib/workspace-permissions";

export function BrandEditPageClient({ brandId }: { brandId: string }) {
  const { activeMembership, isLoading, workspaceId } = useWorkspace();
  const canManageWorkspaceBrands = canManageBrands(activeMembership?.role);
  const title = isLoading
    ? "Brand"
    : canManageWorkspaceBrands
      ? "Edit Brand"
      : "View Brand";
  const description = canManageWorkspaceBrands
    ? "Update the brand name or Brand Constitution. Saving will replace the stored constitution chunks."
    : "Read the brand name and Brand Constitution available in the selected workspace.";
  const brand = useQuery(api.brand.getBrand, {
    ...(workspaceId ? { workspaceId } : {}),
    brandId: brandId as Id<"brands">,
  });

  const content =
    brand === undefined ? (
      <LoadingState label="Loading brand" />
    ) : !brand ? (
      <EmptyState
        title="Brand not found"
        description="Return to setup to choose one of the saved brands."
        actionHref="/setup"
        actionLabel="Back to setup"
      />
    ) : (
      <div className="flex flex-col gap-6">
        <BrandSetupForm brand={brand} />
        <BrandVersionHistory brandId={brand._id} />
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
      />
      {content}
    </div>
  );
}
