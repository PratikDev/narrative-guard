import { ArrowRight } from "lucide-react";

const flowSteps = [
	"Brand Constitution",
	"Content Draft",
	"Audit",
	"Score + Findings + Rewrite",
];

export function FlowBlock() {
	return (
		<div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
			{flowSteps.map((item, index) => (
				<div
					key={item}
					className="flex min-h-20 items-center justify-between gap-3 rounded-lg bg-muted p-3"
				>
					<span className="text-sm font-medium">{item}</span>
					{index < flowSteps.length - 1 ? (
						<ArrowRight className="hidden text-muted-foreground md:block" />
					) : null}
				</div>
			))}
		</div>
	);
}
