import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FlowBlock } from "@/components/landing/WorkflowSection/FlowBlock";
import { workflowSteps } from "@/components/landing/landing-data";
import { Section } from "@/components/landing/Section";

export function WorkflowSection() {
	return (
		<Section
			label="How it works"
			title="From brand rules to publishable feedback."
			description="Narrative Guard turns your brand constitution into a repeatable review workflow writers can use before content reaches approval."
		>
			<div className="grid gap-4 md:grid-cols-3">
				{workflowSteps.map((step, index) => (
					<Card key={step.title}>
						<CardHeader>
							<div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
								<step.icon />
							</div>
							<CardTitle>
								{index + 1}. {step.title}
							</CardTitle>
							<CardDescription>{step.description}</CardDescription>
						</CardHeader>
					</Card>
				))}
			</div>
			<FlowBlock />
		</Section>
	);
}
