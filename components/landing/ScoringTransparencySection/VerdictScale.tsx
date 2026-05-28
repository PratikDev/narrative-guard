import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { verdicts } from "@/components/landing/landing-data";

export function VerdictScale() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Verdict scale</CardTitle>
				<CardDescription>
					Thresholds keep audit results consistent across content types.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-3">
					{verdicts.map((verdict) => (
						<div
							key={verdict.label}
							className="flex items-center justify-between gap-3 rounded-lg border p-3"
						>
							<Badge variant={verdict.variant}>{verdict.label}</Badge>
							<span className="text-sm font-medium">{verdict.range}</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
