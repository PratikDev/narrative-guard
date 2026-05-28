import { Calculator } from "lucide-react";

import { BasePenaltyTable } from "@/components/scoring/BasePenaltyTable";
import { ContentTypePolicyTabs } from "@/components/scoring/ContentTypePolicyTabs";
import { IssueTypeReference } from "@/components/scoring/IssueTypeReference";
import { VerdictScale } from "@/components/scoring/VerdictScale";
import { WorkedScoringExample } from "@/components/scoring/WorkedScoringExample";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { SCORE_FLOORS } from "@/lib/audit-scoring-guide";

export function ScoringGuidePage() {
	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title="Scoring Guide"
				description="How audit scores are calculated across different content types, including weights, penalties, strictness rules, caps, and verdict thresholds."
			/>

			<OverviewSection />
			<VerdictScale />
			<ContentTypePolicyTabs />
			<IssueTypeReference />
			<BasePenaltyTable />
			<WorkedScoringExample />
		</div>
	);
}

const STEPS = [
	"Every audit starts with five dimension scores.",
	"The platform combines those scores using content-type-specific weights.",
	"It subtracts issue penalties from risky or off-brand findings.",
	"It applies stricter or more forgiving rules depending on content type.",
	"Serious issues can cap the maximum score before the final verdict is assigned.",
];

function OverviewSection() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>How The Final Score Is Built</CardTitle>
				<CardDescription>
					The system starts with quality scores, subtracts risk, and then
					applies guardrails for serious issues.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
					{STEPS.map((step, index) => (
						<div
							key={step}
							className="rounded-lg border bg-background p-3"
						>
							<div className="mb-2 flex size-7 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
								{index + 1}
							</div>
							<p className="text-sm leading-6 text-muted-foreground">{step}</p>
						</div>
					))}
				</div>

				<Alert>
					<Calculator />
					<AlertTitle>Simple formula</AlertTitle>
					<AlertDescription>
						<div className="mt-2 rounded-md bg-muted p-3 font-mono text-sm text-foreground">
							Final Score = Weighted dimension score - issue penalties
						</div>
						<p className="mt-2">
							Then the score is adjusted by score caps, floors, and rounding.
							For one or two non-severe issues on content with a starting score
							of 50 or higher, the floor is{" "}
							<span className="font-medium text-foreground">
								{SCORE_FLOORS.isolatedNonSevereIssues}
							</span>
							.
						</p>
					</AlertDescription>
				</Alert>
			</CardContent>
		</Card>
	);
}
