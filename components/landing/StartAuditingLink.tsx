"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { SignInButton } from "@/components/auth/SignInButton";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/routes";

export function StartAuditingLink({ redirectTo }: { redirectTo?: string }) {
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
				<SignInButton
					size="lg"
					redirectTo={redirectTo}
				>
					Start auditing
					<ArrowRight data-icon="inline-end" />
				</SignInButton>
			</Unauthenticated>
		</>
	);
}
