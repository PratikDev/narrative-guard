import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VERDICT_LABELS } from "@/lib/constants";
import type { Verdict } from "@/lib/types";

const VERDICT_RANGES: Array<{
	verdict: Verdict;
	range: string;
	explanation: string;
}> = [
	{
		verdict: "on_brand",
		range: "85-100",
		explanation: "Strong fit with brand guidance and low risk.",
	},
	{
		verdict: "needs_review",
		range: "65-84",
		explanation: "Mostly usable, but a person should review the flagged areas.",
	},
	{
		verdict: "off_brand",
		range: "0-64",
		explanation: "High risk or poor brand fit. Rewrite before using.",
	},
];

export function VerdictScale() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Verdict Scale</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3 md:grid-cols-3">
					{VERDICT_RANGES.map((item) => (
						<div
							key={item.verdict}
							className="flex min-w-0 flex-col gap-3 rounded-lg border bg-background p-4"
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<StatusBadge verdict={item.verdict} />
								<span className="text-lg font-semibold tabular-nums">
									{item.range}
								</span>
							</div>
							<p className="text-sm leading-6 text-muted-foreground">
								<span className="sr-only">{VERDICT_LABELS[item.verdict]}: </span>
								{item.explanation}
							</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
