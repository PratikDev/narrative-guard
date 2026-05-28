import { DM_Sans, Geist, Geist_Mono } from "next/font/google";

export const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const fontVariableClasses = [
	geistSans.variable,
	geistMono.variable,
	dmSans.variable,
].join(" ");
