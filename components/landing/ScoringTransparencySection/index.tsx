import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/routes";
import { VerdictScale } from "@/components/landing/ScoringTransparencySection/VerdictScale";
import { Section } from "@/components/landing/Section";

const scoreInputs = [
	"Dimension scores",
	"Content-type weights",
	"Issue penalties",
	"Severity",
	"Caps",
	"Verdict thresholds",
];

export function ScoringTransparencySection() {
	return (
		<Section
			label="Scoring transparency"
			title="Scores are explainable before anyone acts on them."
			description="Scores are calculated from dimension scores, content-type weights, issue penalties, severity, caps, and verdict thresholds. The guide explains the system in plain language."
		>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]">
				<Card>
					<CardHeader>
						<CardTitle>What goes into a score</CardTitle>
						<CardDescription>
							The scoring model combines weighted dimensions with issue-level
							penalties so reviewers can see why a draft passed, needs work, or
							missed the brand.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-3 sm:grid-cols-2">
							{scoreInputs.map((item) => (
								<div
									key={item}
									className="rounded-lg bg-muted p-3 text-sm"
								>
									{item}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
				<VerdictScale />
			</div>
			<div>
				<Button
					variant="outline"
					asChild
				>
					<Link href={APP_ROUTES.scoring}>
						Read the scoring guide
						<ArrowRight data-icon="inline-end" />
					</Link>
				</Button>
			</div>
		</Section>
	);
}
