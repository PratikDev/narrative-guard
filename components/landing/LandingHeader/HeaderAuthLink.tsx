"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";

import { SignInButton } from "@/components/auth/SignInButton";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/routes";

export function HeaderAuthLink({ redirectTo }: { redirectTo?: string }) {
	return (
		<>
			<Authenticated>
				<Button asChild>
					<Link href={APP_ROUTES.dashboard}>Dashboard</Link>
				</Button>
			</Authenticated>
			<Unauthenticated>
				<SignInButton redirectTo={redirectTo}>Sign in</SignInButton>
			</Unauthenticated>
		</>
	);
}
