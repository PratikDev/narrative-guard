import { BrandSetupForm } from "@/components/brands/BrandSetupForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockBrands } from "@/lib/mock-data";

export default function SetupPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand Setup"
        description="Create a brand profile and paste the full Brand Constitution as one source of truth for future audits."
      />
      <BrandSetupForm initialBrand={mockBrands[0]} />
    </div>
  );
}
