import { Badge } from "@/components/ui/badge";

export function Section({
	label,
	title,
	description,
	children,
}: {
	label: string;
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<section className="border-b">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
				<div className="flex max-w-3xl flex-col gap-3">
					<Badge
						variant="outline"
						className="w-fit"
					>
						{label}
					</Badge>
					<div className="flex flex-col gap-3">
						<h2 className="text-3xl font-semibold tracking-normal text-balance sm:text-4xl">
							{title}
						</h2>
						<p className="text-base leading-7 text-muted-foreground">
							{description}
						</p>
					</div>
				</div>
				{children}
			</div>
		</section>
	);
}
