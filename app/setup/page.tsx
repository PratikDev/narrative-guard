import { BrandSetupForm } from "@/components/brands/BrandSetupForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function SetupPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands"
        description="Create, edit, or read the Brand Constitutions available in the selected workspace."
      />
      <BrandSetupForm />
    </div>
  );
}
