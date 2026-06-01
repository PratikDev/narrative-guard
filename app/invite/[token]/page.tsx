import { Bell, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/routes";

export default async function InvitePage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	await params;

	// return <AcceptInvitePageClient token={token} />;
	return (
		<main className="flex h-150 items-center justify-center bg-muted/30 p-6">
			<Card className="w-full max-w-lg rounded-lg">
				<CardHeader>
					<div className="mb-2 flex size-10 items-center justify-center rounded-lg border bg-background">
						<Bell className="size-5 text-muted-foreground" />
					</div>
					<CardTitle>Invitation moved to notifications</CardTitle>
					<CardDescription>
						Workspace invitations are now handled directly inside the app.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<Alert>
						<Bell className="size-4" />
						<AlertTitle>Check your notification panel</AlertTitle>
						<AlertDescription>
							Open the bell icon in the top-right corner and accept or reject
							the workspace invitation from there.
						</AlertDescription>
					</Alert>

					<div className="flex flex-col gap-2 sm:flex-row">
						<Button
							asChild
							className="sm:flex-1"
						>
							<Link href={APP_ROUTES.dashboard}>
								Go to app
								<ExternalLink data-icon="inline-end" />
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							className="sm:flex-1"
						>
							<Link href={APP_ROUTES.team}>View team</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
