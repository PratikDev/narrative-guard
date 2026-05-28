"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { AlertCircle } from "lucide-react";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { APP_ROUTES } from "@/lib/routes";

export function AcceptInvitePageClient({ token }: { token: string }) {
	const router = useRouter();
	const acceptInvite = useMutation(api.workspace.acceptInvite);
	const { selectWorkspace } = useWorkspace();
	const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
	const [errorMessage, setErrorMessage] = useState("");

	async function handleAcceptInvite() {
		setStatus("loading");
		setErrorMessage("");

		try {
			const result = await acceptInvite({ token });
			selectWorkspace(result.workspaceId);
			router.push(APP_ROUTES.dashboard);
		} catch (error) {
			setStatus("error");
			setErrorMessage(
				error instanceof Error ? error.message : "Could not accept invite.",
			);
		}
	}

	return (
		<div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-lg items-center">
			<Card className="w-full rounded-lg">
				<CardHeader>
					<CardTitle>Join workspace</CardTitle>
					<CardDescription>
						Accept this invite to start auditing content with the workspace.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{errorMessage ? (
						<Alert variant="destructive">
							<AlertCircle className="size-4" />
							<AlertTitle>Invite could not be accepted</AlertTitle>
							<AlertDescription>{errorMessage}</AlertDescription>
						</Alert>
					) : null}
					<Button
						type="button"
						onClick={handleAcceptInvite}
						disabled={status === "loading"}
					>
						{status === "loading" ? "Joining..." : "Accept invite"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
