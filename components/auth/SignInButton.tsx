"use client";

import { useState, type ComponentProps } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getSafeInternalRedirectPath } from "@/lib/routes";

type SignInButtonProps = Omit<
	ComponentProps<typeof Button>,
	"onClick" | "asChild" | "type"
> & {
	/** Internal path to land on after a successful sign in. */
	redirectTo?: string;
};

export function SignInButton({
	redirectTo,
	disabled,
	children,
	...props
}: SignInButtonProps) {
	const { signIn } = useAuthActions();
	const [isPending, setIsPending] = useState(false);

	async function startSignIn() {
		setIsPending(true);
		try {
			await signIn("google", {
				redirectTo: getSafeInternalRedirectPath(redirectTo ?? null),
			});
		} catch {
			setIsPending(false);
			toast.error("Sign in failed", {
				description:
					"The Google sign-in flow could not be started. Try again in a moment.",
			});
		}
	}

	return (
		<Button
			type="button"
			onClick={startSignIn}
			disabled={disabled || isPending}
			{...props}
		>
			{children}
		</Button>
	);
}
