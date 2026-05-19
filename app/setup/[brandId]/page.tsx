import { BrandEditPageClient } from "@/components/brands/BrandEditPageClient";
import { PageHeader } from "@/components/shared/PageHeader";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Brand"
        description="Update the brand name or Brand Constitution. Saving will replace the stored constitution chunks."
      />
      <BrandEditPageClient brandId={brandId} />
    </div>
  );
}
