import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ISSUE_TYPE_DESCRIPTIONS,
	ISSUE_TYPE_LABELS,
	SCORING_GUIDE_ISSUE_TYPES,
} from "@/lib/audit-scoring-guide";

export function IssueTypeReference() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Issue Type Reference</CardTitle>
				<CardDescription>
					These are the finding types that can subtract points from the weighted
					dimension score.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3 lg:grid-cols-2">
					{SCORING_GUIDE_ISSUE_TYPES.map((issueType) => {
						const description = ISSUE_TYPE_DESCRIPTIONS[issueType];

						return (
							<div
								key={issueType}
								className="rounded-lg border bg-background p-4"
							>
								<h3 className="font-medium">{ISSUE_TYPE_LABELS[issueType]}</h3>
								<dl className="mt-3 grid gap-3 text-sm">
									<div>
										<dt className="font-medium">What it means</dt>
										<dd className="mt-1 leading-6 text-muted-foreground">
											{description.meaning}
										</dd>
									</div>
									<div>
										<dt className="font-medium">Why it matters</dt>
										<dd className="mt-1 leading-6 text-muted-foreground">
											{description.whyItMatters}
										</dd>
									</div>
									<div>
										<dt className="font-medium">Usually triggered by</dt>
										<dd className="mt-1 leading-6 text-muted-foreground">
											{description.usuallyTriggeredBy}
										</dd>
									</div>
								</dl>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
