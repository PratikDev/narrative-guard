"use client";

import { Authenticated, Unauthenticated } from "convex/react";
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
