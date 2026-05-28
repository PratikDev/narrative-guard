import { TeamPageClient } from "@/components/team/TeamPageClient";
import { PageHeader } from "@/components/shared/PageHeader";

export default function TeamPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Team"
				description="Manage workspace members, roles, and pending invite links."
			/>
			<TeamPageClient />
		</div>
	);
}
