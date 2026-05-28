import {
	AlertTriangle,
	ArrowRight,
	BadgeCheck,
	ClipboardCheck,
	FileText,
	Megaphone,
	PenLine,
	SearchCheck,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
	HeaderAuthLink,
	StartAuditingLink,
} from "@/components/landing/LandingAuthLinks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/routes";

const dashboardSignInPath = `${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.dashboard)}`;
const auditSignInPath = `${APP_ROUTES.signIn}?next=${encodeURIComponent(APP_ROUTES.audit)}`;

const contentTypes = [
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

const outputItems = [
	"Final score",
	"Verdict",
	"Findings",
	"Issue types",
	"Rewrite suggestion",
	"Score breakdown",
	"Downloadable report",
];

const useCases = [
	"Review campaign copy before launch",
	"Check social posts before publishing",
	"Validate website copy",
	"Review ad claims",
	"Align press releases with brand voice",
	"Give writers clearer feedback",
];

const workflowSteps = [
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

const verdicts = [
	{ label: "Off Brand", range: "0-64", variant: "destructive" as const },
	{ label: "Needs Review", range: "65-84", variant: "secondary" as const },
	{ label: "On Brand", range: "85-100", variant: "default" as const },
];

export function LandingPage() {
	return (
		<main className="min-h-svh bg-background">
			<LandingHeader />
			<HeroSection />
			<WorkflowSection />
			<AuditTypesSection />
			<ReportOutputSection />
			<ScoringTransparencySection />
			<UseCasesSection />
			<FinalCtaSection />
		</main>
	);
}

function LandingHeader() {
	return (
		<header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
			<div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				<Link
					href={APP_ROUTES.home}
					className="flex min-w-0 items-center gap-2 font-medium"
				>
					<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<ShieldCheck />
					</span>
					<span className="truncate">Narrative Guard</span>
				</Link>
				<nav className="flex items-center gap-2">
					<Button
						variant="ghost"
						asChild
					>
						<Link href={APP_ROUTES.scoring}>Scoring</Link>
					</Button>
					<HeaderAuthLink signedOutHref={dashboardSignInPath} />
				</nav>
			</div>
		</header>
	);
}

function HeroSection() {
	return (
		<section className="border-b">
			<div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-screen-2xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(28rem,0.72fr)_minmax(0,1.38fr)] lg:px-8 xl:gap-12">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-3">
						<Badge
							variant="secondary"
							className="w-fit"
						>
							AI brand constitution audits
						</Badge>
						<div className="flex flex-col gap-4">
							<p className="text-sm font-medium text-muted-foreground">
								Narrative Guard
							</p>
							<h1 className="max-w-2xl text-4xl font-semibold tracking-normal text-balance sm:text-5xl lg:text-6xl">
								Keep every message on brand.
							</h1>
							<p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
								Narrative Guard helps teams audit content against their brand
								constitution before publishing. Check marketing copy, social
								posts, emails, ads, press releases, and website copy with
								content-aware scoring and practical rewrite guidance.
							</p>
						</div>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row">
						<StartAuditingLink signedOutHref={dashboardSignInPath} />
						<Button
							size="lg"
							variant="outline"
							asChild
						>
							<Link href={APP_ROUTES.scoring}>See how scoring works</Link>
						</Button>
					</div>
				</div>
				<ProductPreview
					src="/previews/dashboard.png"
					alt="Narrative Guard dashboard showing audit volume, brand health, and recent reports"
					priority
				/>
			</div>
		</section>
	);
}

function WorkflowSection() {
	return (
		<Section
			label="How it works"
			title="From brand rules to publishable feedback."
			description="Narrative Guard turns your brand constitution into a repeatable review workflow writers can use before content reaches approval."
		>
			<div className="grid gap-4 md:grid-cols-3">
				{workflowSteps.map((step, index) => (
					<Card key={step.title}>
						<CardHeader>
							<div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
								<step.icon />
							</div>
							<CardTitle>
								{index + 1}. {step.title}
							</CardTitle>
							<CardDescription>{step.description}</CardDescription>
						</CardHeader>
					</Card>
				))}
			</div>
			<FlowBlock />
		</Section>
	);
}

function AuditTypesSection() {
	return (
		<Section
			label="What it audits"
			title="Different content deserves different judgment."
			description="Each content type is evaluated differently, so a press release is not scored like an ad, email, or social post."
		>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{contentTypes.map((type) => (
					<Card
						key={type.name}
						size="sm"
					>
						<CardHeader>
							<CardTitle>{type.name}</CardTitle>
							<CardDescription>{type.description}</CardDescription>
						</CardHeader>
					</Card>
				))}
			</div>
		</Section>
	);
}

function ReportOutputSection() {
	return (
		<Section
			label="Report output"
			title="Clear decisions, not just a score."
			description="Every audit produces an actionable report writers and reviewers can use to improve the draft and explain the decision."
		>
			<div className="grid items-start gap-6 lg:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)]">
				<div className="grid h-full gap-3 sm:grid-cols-2 lg:grid-cols-1">
					{outputItems.map((item) => (
						<div
							key={item}
							className="flex items-center gap-2 rounded-lg border bg-card p-3 text-sm"
						>
							<BadgeCheck className="text-muted-foreground" />
							<span>{item}</span>
						</div>
					))}
				</div>
				<ProductPreview
					src="/previews/history.png"
					alt="Narrative Guard report history showing saved reports and verdicts"
				/>
				<div className="lg:col-span-2">
					<FindingAnatomy />
				</div>
			</div>
		</Section>
	);
}

function ScoringTransparencySection() {
	return (
		<Section
			label="Scoring transparency"
			title="Scores are explainable before anyone acts on them."
			description="Scores are calculated from dimension scores, content-type weights, issue penalties, severity, caps, and verdict thresholds. The guide explains the system in plain language."
		>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]">
				<Card>
					<CardHeader>
						<CardTitle>What goes into a score</CardTitle>
						<CardDescription>
							The scoring model combines weighted dimensions with issue-level
							penalties so reviewers can see why a draft passed, needs work, or
							missed the brand.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-3 sm:grid-cols-2">
							{[
								"Dimension scores",
								"Content-type weights",
								"Issue penalties",
								"Severity",
								"Caps",
								"Verdict thresholds",
							].map((item) => (
								<div
									key={item}
									className="rounded-lg bg-muted p-3 text-sm"
								>
									{item}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
				<VerdictScale />
			</div>
			<div>
				<Button
					variant="outline"
					asChild
				>
					<Link href={APP_ROUTES.scoring}>
						Read the scoring guide
						<ArrowRight data-icon="inline-end" />
					</Link>
				</Button>
			</div>
		</Section>
	);
}

function UseCasesSection() {
	return (
		<Section
			label="Use cases"
			title="Practical checks for teams that publish often."
			description="Use Narrative Guard wherever brand voice, claims, tone, and message discipline matter."
		>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{useCases.map((useCase) => (
					<Card
						key={useCase}
						size="sm"
					>
						<CardHeader>
							<div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
								<SearchCheck />
							</div>
							<CardTitle>{useCase}</CardTitle>
						</CardHeader>
					</Card>
				))}
			</div>
			<RewriteExample />
		</Section>
	);
}

function FinalCtaSection() {
	return (
		<section className="border-t bg-muted/30">
			<div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8">
				<div className="flex max-w-2xl flex-col gap-2">
					<p className="text-sm font-medium text-muted-foreground">
						Ready for the first review?
					</p>
					<h2 className="text-3xl font-semibold tracking-normal">
						Audit your first piece of content.
					</h2>
				</div>
				<StartAuditingLink signedOutHref={auditSignInPath} />
			</div>
		</section>
	);
}

function Section({
	label,
	title,
	description,
	children,
}: {
	label: string;
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<section className="border-b">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
				<div className="flex max-w-3xl flex-col gap-3">
					<Badge
						variant="outline"
						className="w-fit"
					>
						{label}
					</Badge>
					<div className="flex flex-col gap-3">
						<h2 className="text-3xl font-semibold tracking-normal text-balance sm:text-4xl">
							{title}
						</h2>
						<p className="text-base leading-7 text-muted-foreground">
							{description}
						</p>
					</div>
				</div>
				{children}
			</div>
		</section>
	);
}

function ProductPreview({
	src,
	alt,
	priority = false,
}: {
	src: string;
	alt: string;
	priority?: boolean;
}) {
	return (
		<div className="overflow-hidden rounded-xl border bg-card shadow-sm">
			<Image
				src={src}
				alt={alt}
				width={1440}
				height={1024}
				priority={priority}
				className="h-auto w-full"
				sizes="(min-width: 1024px) 56vw, 100vw"
			/>
		</div>
	);
}

function FlowBlock() {
	return (
		<div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
			{[
				"Brand Constitution",
				"Content Draft",
				"Audit",
				"Score + Findings + Rewrite",
			].map((item, index) => (
				<div
					key={item}
					className="flex min-h-20 items-center justify-between gap-3 rounded-lg bg-muted p-3"
				>
					<span className="text-sm font-medium">{item}</span>
					{index < 3 ? (
						<ArrowRight className="hidden text-muted-foreground md:block" />
					) : null}
				</div>
			))}
		</div>
	);
}

function FindingAnatomy() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Finding anatomy</CardTitle>
				<CardDescription>
					Each issue is written so a reviewer can understand the problem and a
					writer can fix it.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3 sm:grid-cols-2">
					<AnatomyItem
						icon={FileText}
						label="Issue type"
						value="Unsupported claim"
					/>
					<AnatomyItem
						icon={AlertTriangle}
						label="Severity"
						value="High"
					/>
					<AnatomyItem
						icon={SearchCheck}
						label="Problem"
						value="The draft promises an outcome the constitution does not support."
					/>
					<AnatomyItem
						icon={Sparkles}
						label="Recommendation"
						value="Use approved proof points and soften the claim."
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function AnatomyItem({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof FileText;
	label: string;
	value: string;
}) {
	return (
		<div className="flex min-h-24 flex-col gap-2 rounded-lg bg-muted p-3">
			<div className="flex items-center gap-2 text-sm font-medium">
				<Icon />
				<span>{label}</span>
			</div>
			<p className="text-sm leading-6 text-muted-foreground">{value}</p>
		</div>
	);
}

function VerdictScale() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Verdict scale</CardTitle>
				<CardDescription>
					Thresholds keep audit results consistent across content types.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-3">
					{verdicts.map((verdict) => (
						<div
							key={verdict.label}
							className="flex items-center justify-between gap-3 rounded-lg border p-3"
						>
							<Badge variant={verdict.variant}>{verdict.label}</Badge>
							<span className="text-sm font-medium">{verdict.range}</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function RewriteExample() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Before and after rewrite</CardTitle>
				<CardDescription>
					Suggestions preserve intent while bringing the draft closer to the
					brand constitution.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="flex flex-col gap-2 rounded-lg border p-4">
						<div className="flex items-center gap-2 text-sm font-medium">
							<Megaphone />
							Original copy
						</div>
						<p className="text-sm leading-6 text-muted-foreground">
							Our platform guarantees instant growth for every team that
							switches today.
						</p>
					</div>
					<div className="flex flex-col gap-2 rounded-lg border bg-secondary/60 p-4">
						<div className="flex items-center gap-2 text-sm font-medium">
							<Sparkles />
							Rewritten copy
						</div>
						<p className="text-sm leading-6 text-muted-foreground">
							Narrative Guard helps teams find brand risks earlier and improve
							content before it reaches approval.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
