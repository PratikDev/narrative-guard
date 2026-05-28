import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { contentTypes } from "@/components/landing/landing-data";
import { Section } from "@/components/landing/Section";

export function AuditTypesSection() {
	return (
		<Section
			label="What it audits"
			title="Different content deserves different judgment."
			description="Each content type is evaluated differently, so a press release is not scored like an ad, email, or social post."
		>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{contentTypes.map((type) => (
					<Card
						key={type.name}
						size="sm"
					>
						<CardHeader>
							<CardTitle>{type.name}</CardTitle>
							<CardDescription>{type.description}</CardDescription>
						</CardHeader>
					</Card>
				))}
			</div>
		</Section>
	);
}
