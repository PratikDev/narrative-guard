import { Megaphone, Sparkles } from "lucide-react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function RewriteExample() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Before and after rewrite</CardTitle>
				<CardDescription>
					Suggestions preserve intent while bringing the draft closer to the
					brand constitution.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="flex flex-col gap-2 rounded-lg border p-4">
						<div className="flex items-center gap-2 text-sm font-medium">
							<Megaphone />
							Original copy
						</div>
						<p className="text-sm leading-6 text-muted-foreground">
							Our platform guarantees instant growth for every team that
							switches today.
						</p>
					</div>
					<div className="flex flex-col gap-2 rounded-lg border bg-secondary/60 p-4">
						<div className="flex items-center gap-2 text-sm font-medium">
							<Sparkles />
							Rewritten copy
						</div>
						<p className="text-sm leading-6 text-muted-foreground">
							Narrative Guard helps teams find brand risks earlier and improve
							content before it reaches approval.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
