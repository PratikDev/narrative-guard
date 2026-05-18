import { AuditForm } from "@/components/audit/AuditForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Audit"
        description="Paste content, choose a brand and content type, then generate a mock brand-coherence report."
      />
      <AuditForm />
    </div>
  );
}
