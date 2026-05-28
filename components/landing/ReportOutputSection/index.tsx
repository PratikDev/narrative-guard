import { BadgeCheck } from "lucide-react";
import { FindingAnatomy } from "@/components/landing/ReportOutputSection/FindingAnatomy";
import { outputItems } from "@/components/landing/landing-data";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { Section } from "@/components/landing/Section";

export function ReportOutputSection() {
	return (
		<Section
			label="Report output"
			title="Clear decisions, not just a score."
			description="Every audit produces an actionable report writers and reviewers can use to improve the draft and explain the decision."
		>
			<div className="grid items-start gap-6 lg:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)]">
				<div className="grid h-full gap-3 sm:grid-cols-2 lg:grid-cols-1">
					{outputItems.map((item) => (
						<div
							key={item}
							className="flex items-center gap-2 rounded-lg border bg-card p-3 text-sm"
						>
							<BadgeCheck className="text-muted-foreground" />
							<span>{item}</span>
						</div>
					))}
				</div>
				<ProductPreview
					src="/previews/history.png"
					alt="Narrative Guard report history showing saved reports and verdicts"
				/>
				<div className="lg:col-span-2">
					<FindingAnatomy />
				</div>
			</div>
		</Section>
	);
}
