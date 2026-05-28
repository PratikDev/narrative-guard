import { SearchCheck } from "lucide-react";

import { RewriteExample } from "@/components/landing/UseCasesSection/RewriteExample";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useCases } from "@/components/landing/landing-data";
import { Section } from "@/components/landing/Section";

export function UseCasesSection() {
	return (
		<Section
			label="Use cases"
			title="Practical checks for teams that publish often."
			description="Use Narrative Guard wherever brand voice, claims, tone, and message discipline matter."
		>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{useCases.map((useCase) => (
					<Card
						key={useCase}
						size="sm"
					>
						<CardHeader>
							<div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
								<SearchCheck />
							</div>
							<CardTitle>{useCase}</CardTitle>
						</CardHeader>
					</Card>
				))}
			</div>
			<RewriteExample />
		</Section>
	);
}
