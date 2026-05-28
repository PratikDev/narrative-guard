import { ClipboardCheck, PenLine, ShieldCheck } from "lucide-react";

import { APP_ROUTES } from "@/lib/routes";

export const dashboardSignInPath = `${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.dashboard)}`;
export const auditSignInPath = `${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.audit)}`;

export const contentTypes = [
	{ name: "Generic text", description: "Fast checks for internal drafts." },
	{
		name: "Social posts",
		description: "Short-form voice, clarity, and claims.",
	},
	{ name: "Website copy", description: "Positioning, proof, and message fit." },
	{ name: "Email", description: "Audience fit, tone, and conversion clarity." },
	{
		name: "Press releases",
		description: "Formal voice and approved narratives.",
	},
	{ name: "Ad copy", description: "Claims, urgency, and brand boundaries." },
];

export const outputItems = [
	"Final score",
	"Verdict",
	"Findings",
	"Issue types",
	"Rewrite suggestion",
	"Score breakdown",
	"Downloadable report",
];

export const useCases = [
	"Review campaign copy before launch",
	"Check social posts before publishing",
	"Validate website copy",
	"Review ad claims",
	"Align press releases with brand voice",
	"Give writers clearer feedback",
];

export const workflowSteps = [
	{
		title: "Add your brand constitution",
		description:
			"Capture the voice, values, approved claims, and messaging boundaries writers should follow.",
		icon: ShieldCheck,
	},
	{
		title: "Paste content and choose a content type",
		description:
			"Audit marketing copy, social posts, emails, ads, press releases, and website copy in the right context.",
		icon: PenLine,
	},
	{
		title: "Review score, findings, and rewrite suggestions",
		description:
			"Turn vague brand feedback into specific issues, severity, recommendations, and usable rewrites.",
		icon: ClipboardCheck,
	},
];

export const verdicts = [
	{ label: "Off Brand", range: "0-64", variant: "destructive" as const },
	{ label: "Needs Review", range: "65-84", variant: "secondary" as const },
	{ label: "On Brand", range: "85-100", variant: "default" as const },
];
