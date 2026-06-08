import { AuditForm } from "@/components/audit/AuditForm";
import { PageHeader } from "@/components/shared/PageHeader";

type AuditPageProps = {
	searchParams: Promise<{
		sourceReportId?: string | string[];
		draftId?: string | string[];
	}>;
};

export default async function AuditPage({ searchParams }: AuditPageProps) {
	const params = await searchParams;
	const sourceReportId = Array.isArray(params.sourceReportId)
		? params.sourceReportId[0]
		: params.sourceReportId;
	const draftId = Array.isArray(params.draftId)
		? params.draftId[0]
		: params.draftId;

	return (
		<div className="space-y-6">
			<PageHeader
				title="Content Audit"
				description="Paste content, choose a brand and content type, then generate a mock brand-coherence report."
			/>
			<AuditForm
				key={draftId ?? sourceReportId ?? "new-audit"}
				sourceReportId={sourceReportId}
				draftId={draftId}
			/>
		</div>
	);
}
