"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/routes";

export function HeaderAuthLink({ signedOutHref }: { signedOutHref: string }) {
	return (
		<>
			<Authenticated>
				<Button asChild>
					<Link href={APP_ROUTES.dashboard}>Dashboard</Link>
				</Button>
			</Authenticated>
			<Unauthenticated>
				<Button asChild>
					<Link href={signedOutHref}>Sign in</Link>
				</Button>
			</Unauthenticated>
		</>
	);
}

export function StartAuditingLink({
	signedOutHref,
}: {
	signedOutHref: string;
}) {
	return (
		<>
			<Authenticated>
				<Button
					size="lg"
					asChild
				>
					<Link href={APP_ROUTES.audit}>
						Start auditing
						<ArrowRight data-icon="inline-end" />
					</Link>
				</Button>
			</Authenticated>
			<Unauthenticated>
				<Button
					size="lg"
					asChild
				>
					<Link href={signedOutHref}>
						Start auditing
						<ArrowRight data-icon="inline-end" />
					</Link>
				</Button>
			</Unauthenticated>
		</>
	);
}
