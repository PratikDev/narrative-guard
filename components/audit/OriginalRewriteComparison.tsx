import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Change } from "diff";
import { diffWordsWithSpace } from "diff";

function getDiffPartClassName(part: Change) {
	if (part.added) {
		return "rounded-sm bg-success/15 px-0.5 text-success underline decoration-success/50 underline-offset-2";
	}

	if (part.removed) {
		return "rounded-sm bg-error/10 px-0.5 text-error line-through decoration-error/60";
	}

	return "text-muted-foreground";
}

function InlineDiff({
	original,
	rewrite,
}: {
	original: string;
	rewrite: string;
}) {
	const diffParts = diffWordsWithSpace(original, rewrite);
	const hasChanges = diffParts.some((part) => part.added || part.removed);

	if (!hasChanges) {
		return (
			<div className="rounded-lg border bg-background p-4">
				<p className="text-sm text-muted-foreground">
					No text changes were detected between the original and rewritten
					content.
				</p>
			</div>
		);
	}

	return (
		<section className="rounded-lg border bg-background p-4">
			<div className="flex flex-wrap items-center gap-2">
				<Badge
					variant="outline"
					className="border-error/30 bg-error/5 text-error"
				>
					Removed
				</Badge>
				<Badge
					variant="outline"
					className="border-success/30 bg-success/5 text-success"
				>
					Added
				</Badge>
			</div>
			<p className="mt-4 whitespace-pre-wrap text-sm leading-7">
				{diffParts.map((part, index) => (
					<span
						key={`${part.added ? "added" : part.removed ? "removed" : "same"}-${index}`}
						className={cn(getDiffPartClassName(part))}
					>
						{part.value}
					</span>
				))}
			</p>
		</section>
	);
}

function SideBySideComparison({
	original,
	rewrite,
}: {
	original: string;
	rewrite: string;
}) {
	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<section className="rounded-lg border bg-background p-4">
				<h3 className="text-sm font-medium">Original</h3>
				<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
					{original}
				</p>
			</section>
			<section className="rounded-lg border border-success/30 bg-success/5 p-4">
				<h3 className="text-sm font-medium">Rewritten</h3>
				<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
					{rewrite}
				</p>
			</section>
		</div>
	);
}

export function OriginalRewriteComparison({
	original,
	rewrite,
}: {
	original: string;
	rewrite: string;
}) {
	return (
		<Tabs defaultValue="diff">
			<TabsList>
				<TabsTrigger value="diff">Diff</TabsTrigger>
				<TabsTrigger value="side-by-side">Side by side</TabsTrigger>
			</TabsList>
			<TabsContent value="diff">
				<InlineDiff
					original={original}
					rewrite={rewrite}
				/>
			</TabsContent>
			<TabsContent value="side-by-side">
				<SideBySideComparison
					original={original}
					rewrite={rewrite}
				/>
			</TabsContent>
		</Tabs>
	);
}
