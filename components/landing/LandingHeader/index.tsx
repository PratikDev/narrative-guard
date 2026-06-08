import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/routes";
import { HeaderAuthLink } from "@/components/landing/LandingHeader/HeaderAuthLink";
import { dashboardSignInPath } from "@/components/landing/landing-data";

export function LandingHeader() {
	return (
		<header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
			<div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				<Link
					href={APP_ROUTES.home}
					className="flex min-w-0 items-center gap-2 font-medium"
				>
					<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<ShieldCheck />
					</span>
					<span className="truncate">Narrative Guard</span>
				</Link>
				<nav className="flex items-center gap-2">
					<Button
						variant="ghost"
						asChild
					>
						<Link href={APP_ROUTES.scoring}>Scoring</Link>
					</Button>
					<Button
						variant="ghost"
						asChild
					>
						<Link href={APP_ROUTES.docs}>Docs</Link>
					</Button>
					<HeaderAuthLink signedOutHref={dashboardSignInPath} />
				</nav>
			</div>
		</header>
	);
}
