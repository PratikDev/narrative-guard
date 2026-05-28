import { StatusBadge } from "@/components/shared/StatusBadge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	BASE_ISSUE_PENALTIES,
	CONTENT_TYPE_SCORING_GUIDE,
	ISSUE_TYPE_LABELS,
} from "@/lib/audit-scoring-guide";

const weightedDimensionScore = 82;
const contentType = "ad_copy";
const issueType = "absolute_claim";
const severity = "high";
const basePenalty = BASE_ISSUE_PENALTIES[issueType][severity];
const multiplier =
	CONTENT_TYPE_SCORING_GUIDE[contentType].penaltyMultipliers[issueType];
const actualPenalty = Math.round(basePenalty * multiplier);
const finalScore = weightedDimensionScore - actualPenalty;

export function WorkedScoringExample() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Worked Example</CardTitle>
				<CardDescription>
					A simple example showing how one serious finding can change the final
					score.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.45fr)]">
					<div className="rounded-lg border bg-background p-4">
						<p className="text-sm leading-6 text-muted-foreground">
							Say the content is{" "}
							<span className="font-medium text-foreground">Ad copy</span>. Its
							dimension scores combine to{" "}
							<span className="font-medium text-foreground">
								{weightedDimensionScore}
							</span>
							, but the audit finds a{" "}
							<span className="font-medium text-foreground">
								high {ISSUE_TYPE_LABELS[issueType].toLowerCase()}
							</span>
							. A high absolute claim has a base penalty of{" "}
							<span className="font-medium text-foreground">{basePenalty}</span>.
							For ad copy, that issue is much stricter, so the penalty is
							multiplied by{" "}
							<span className="font-medium text-foreground">
								{multiplier}x
							</span>
							.
						</p>
						<p className="mt-3 text-sm leading-6 text-muted-foreground">
							The actual penalty is{" "}
							<span className="font-medium text-foreground">
								{basePenalty} x {multiplier} = {actualPenalty}
							</span>
							. The score after penalty is{" "}
							<span className="font-medium text-foreground">
								{weightedDimensionScore} - {actualPenalty} = {finalScore}
							</span>
							.
						</p>
					</div>

					<div className="flex flex-col justify-between gap-4 rounded-lg border bg-background p-4">
						<div>
							<p className="text-sm text-muted-foreground">Final score</p>
							<div className="mt-1 flex items-baseline gap-1">
								<span className="text-4xl font-semibold tabular-nums text-red-700">
									{finalScore}
								</span>
								<span className="text-sm text-muted-foreground">/100</span>
							</div>
						</div>
						<div className="flex items-center justify-between gap-3">
							<span className="text-sm text-muted-foreground">Verdict</span>
							<StatusBadge verdict="off_brand" />
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
