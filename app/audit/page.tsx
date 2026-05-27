import { AuditForm } from "@/components/audit/AuditForm";
import { PageHeader } from "@/components/shared/PageHeader";

type AuditPageProps = {
	searchParams: Promise<{
		sourceReportId?: string | string[];
	}>;
};

export default async function AuditPage({ searchParams }: AuditPageProps) {
	const params = await searchParams;
	const sourceReportId = Array.isArray(params.sourceReportId)
		? params.sourceReportId[0]
		: params.sourceReportId;

	return (
		<div className="space-y-6">
			<PageHeader
				title="Content Audit"
				description="Paste content, choose a brand and content type, then generate a mock brand-coherence report."
			/>
			<AuditForm
				key={sourceReportId ?? "new-audit"}
				sourceReportId={sourceReportId}
			/>
		</div>
	);
}
