import { BrandEditPageClient } from "@/components/brands/BrandEditPageClient";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;

  return (
    <BrandEditPageClient brandId={brandId} />
  );
}
