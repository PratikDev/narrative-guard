import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	BASE_ISSUE_PENALTIES,
	FINDING_SEVERITIES,
	ISSUE_TYPE_LABELS,
	SCORING_GUIDE_ISSUE_TYPES,
} from "@/lib/audit-scoring-guide";

const SEVERITY_LABELS = {
	low: "Low",
	medium: "Medium",
	high: "High",
};

export function BasePenaltyTable() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Base Penalty Table</CardTitle>
				<CardDescription>
					Actual penalty = base penalty x content type multiplier.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Issue type</TableHead>
							{FINDING_SEVERITIES.map((severity) => (
								<TableHead
									key={severity}
									className="text-right"
								>
									{SEVERITY_LABELS[severity]}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{SCORING_GUIDE_ISSUE_TYPES.map((issueType) => (
							<TableRow key={issueType}>
								<TableCell className="font-medium">
									{ISSUE_TYPE_LABELS[issueType]}
								</TableCell>
								{FINDING_SEVERITIES.map((severity) => (
									<TableCell
										key={severity}
										className="text-right tabular-nums"
									>
										{BASE_ISSUE_PENALTIES[issueType][severity]}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
