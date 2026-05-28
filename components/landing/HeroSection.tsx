import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { StartAuditingLink } from "@/components/landing/StartAuditingLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/routes";
import { dashboardSignInPath } from "@/components/landing/landing-data";
import { ProductPreview } from "@/components/landing/ProductPreview";

export function HeroSection() {
	return (
		<section className="border-b">
			<div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-screen-2xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(28rem,0.72fr)_minmax(0,1.38fr)] lg:px-8 xl:gap-12">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-3">
						<Badge
							variant="secondary"
							className="w-fit"
						>
							AI brand constitution audits
						</Badge>
						<div className="flex flex-col gap-4">
							<p className="text-sm font-medium text-muted-foreground">
								Narrative Guard
							</p>
							<h1 className="max-w-2xl text-4xl font-semibold tracking-normal text-balance sm:text-5xl lg:text-6xl">
								Keep every message on brand.
							</h1>
							<p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
								Narrative Guard helps teams audit content against their brand
								constitution before publishing. Check marketing copy, social
								posts, emails, ads, press releases, and website copy with
								content-aware scoring and practical rewrite guidance.
							</p>
						</div>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row">
						<StartAuditingLink signedOutHref={dashboardSignInPath} />
						<Button
							size="lg"
							variant="outline"
							asChild
						>
							<Link href={APP_ROUTES.scoring}>
								See how scoring works
								<ArrowRight data-icon="inline-end" />
							</Link>
						</Button>
					</div>
				</div>
				<ProductPreview
					src="/previews/dashboard.png"
					alt="Narrative Guard dashboard showing audit volume, brand health, and recent reports"
					priority
				/>
			</div>
		</section>
	);
}
