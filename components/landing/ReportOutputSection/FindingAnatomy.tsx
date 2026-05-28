import { AlertTriangle, FileText, SearchCheck, Sparkles } from "lucide-react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type AnatomyIcon = typeof FileText;

export function FindingAnatomy() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Finding anatomy</CardTitle>
				<CardDescription>
					Each issue is written so a reviewer can understand the problem and a
					writer can fix it.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3 sm:grid-cols-2">
					<AnatomyItem
						icon={FileText}
						label="Issue type"
						value="Unsupported claim"
					/>
					<AnatomyItem
						icon={AlertTriangle}
						label="Severity"
						value="High"
					/>
					<AnatomyItem
						icon={SearchCheck}
						label="Problem"
						value="The draft promises an outcome the constitution does not support."
					/>
					<AnatomyItem
						icon={Sparkles}
						label="Recommendation"
						value="Use approved proof points and soften the claim."
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function AnatomyItem({
	icon: Icon,
	label,
	value,
}: {
	icon: AnatomyIcon;
	label: string;
	value: string;
}) {
	return (
		<div className="flex min-h-24 flex-col gap-2 rounded-lg bg-muted p-3">
			<div className="flex items-center gap-2 text-sm font-medium">
				<Icon />
				<span>{label}</span>
			</div>
			<p className="text-sm leading-6 text-muted-foreground">{value}</p>
		</div>
	);
}
