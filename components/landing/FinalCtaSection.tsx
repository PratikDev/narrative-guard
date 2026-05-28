import { StartAuditingLink } from "@/components/landing/StartAuditingLink";
import { auditSignInPath } from "@/components/landing/landing-data";

export function FinalCtaSection() {
	return (
		<section className="border-t bg-muted/30">
			<div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8">
				<div className="flex max-w-2xl flex-col gap-2">
					<p className="text-sm font-medium text-muted-foreground">
						Ready for the first review?
					</p>
					<h2 className="text-3xl font-semibold tracking-normal">
						Audit your first piece of content.
					</h2>
				</div>
				<StartAuditingLink signedOutHref={auditSignInPath} />
			</div>
		</section>
	);
}
