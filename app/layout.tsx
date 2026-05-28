import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

import { AuthGate } from "@/components/auth/AuthGate";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

import { fontVariableClasses } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
	title: "NarrativeGuard",
	description: "AI brand voice coherence review for business teams",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={cn(
				"h-full scroll-pt-20 antialiased",
				fontVariableClasses,
			)}
		>
			<body className="min-h-full">
				<ConvexAuthNextjsServerProvider>
					<ConvexClientProvider>
						<TooltipProvider>
							<AuthGate>{children}</AuthGate>
						</TooltipProvider>
					</ConvexClientProvider>
				</ConvexAuthNextjsServerProvider>
			</body>
		</html>
	);
}
