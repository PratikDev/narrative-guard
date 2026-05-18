import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/components/layout/AppShell";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "NarrativeGuard",
	description: "AI brand voice coherence review for business teams",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={cn(
				"h-full scroll-pt-20 antialiased",
				geistSans.variable,
				geistMono.variable,
				dmSans.variable,
			)}
		>
			<body className="min-h-full">
				<ConvexClientProvider>
					<TooltipProvider>
						<AppShell>{children}</AppShell>
					</TooltipProvider>
				</ConvexClientProvider>
			</body>
		</html>
	);
}
