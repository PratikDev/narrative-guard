"use client";

import { useQuery } from "convex/react";
import { CalendarClock, FileText, Lock, Search, Share2 } from "lucide-react";
import { useMemo, useState } from "react";

import { CopyButton } from "@/components/shared/CopyButton";
import { LoadingState } from "@/components/shared/LoadingState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import {
	featureRows,
	navigationGroups,
	pitchSections,
	technicalSections,
	type DocsSection,
} from "./docs-data";

type DocsStats = {
	users: number;
	workspaces: number;
	activeMembers: number;
	pendingInvites: number;
	brands: number;
	reports: number;
	completedReports: number;
	findings: number;
	averageScore: number;
	onBrandReports: number;
	needsReviewReports: number;
	offBrandReports: number;
	sampleLimit: number;
};

function formatDateTime(value: number) {
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function sectionMatches(section: DocsSection, query: string) {
	if (!query) return true;

	const haystack = [
		section.title,
		section.kicker,
		section.summary,
		...section.items,
	]
		.join(" ")
		.toLowerCase();

	return haystack.includes(query.toLowerCase());
}

function buildMarkdown(args: {
	stats: DocsStats;
	teamName: string;
	teamMembers: {
		fullName: string;
		role: string;
		email: string;
		imageUrl: string;
	}[];
}) {
	const lines = [
		"# Narrative Guard Docs",
		"",
		"## Live Snapshot",
		`- Users: ${args.stats.users}`,
		`- Workspaces: ${args.stats.workspaces}`,
		`- Brands: ${args.stats.brands}`,
		`- Reports: ${args.stats.reports}`,
		`- Findings: ${args.stats.findings}`,
		`- Average score: ${args.stats.averageScore}`,
		"",
		"## Pitch Deck",
		...pitchSections.flatMap((section) => [
			"",
			`### ${section.title}`,
			section.summary,
			...section.items.map((item) => `- ${item}`),
		]),
		"",
		"## Technical Documentation",
		...technicalSections.flatMap((section) => [
			"",
			`### ${section.title}`,
			section.summary,
			...section.items.map((item) => `- ${item}`),
		]),
		"",
		"## Team",
		args.teamName,
		...args.teamMembers.map(
			(member) => `- ${member.fullName} - ${member.role} - ${member.email}`,
		),
	];

	return lines.join("\n");
}

function downloadMarkdown(markdown: string) {
	const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "narrative-guard-docs.md";
	link.click();
	URL.revokeObjectURL(url);
}

function StatCard({ label, value }: { label: string; value: number | string }) {
	return (
		<Card className="rounded-lg">
			<CardContent className="p-4">
				<p className="text-sm text-muted-foreground">{label}</p>
				<p className="mt-2 text-2xl font-semibold">{value}</p>
			</CardContent>
		</Card>
	);
}

function SectionCard({ section }: { section: DocsSection }) {
	return (
		<Card
			id={section.id}
			className="scroll-mt-20 rounded-lg"
		>
			<CardHeader>
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="outline">{section.kicker}</Badge>
					<CardTitle>{section.title}</CardTitle>
				</div>
				<CardDescription>{section.summary}</CardDescription>
			</CardHeader>
			<CardContent>
				<ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
					{section.items.map((item) => (
						<li
							key={item}
							className="rounded-lg border bg-muted/30 p-3"
						>
							{item}
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}

function ArchitectureSvg() {
	return (
		<Card
			id="architecture-diagram"
			className="scroll-mt-20 rounded-lg"
		>
			<CardHeader>
				<CardTitle>Architecture Diagram</CardTitle>
				<CardDescription>
					UI to Convex API to services and database, rendered as SVG.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<svg
					viewBox="0 0 980 260"
					role="img"
					aria-label="Narrative Guard architecture diagram"
					className="h-auto w-full rounded-lg border bg-background"
				>
					<defs>
						<marker
							id="arrow"
							markerHeight="8"
							markerWidth="8"
							orient="auto"
							refX="7"
							refY="4"
						>
							<path
								d="M0,0 L8,4 L0,8 z"
								fill="currentColor"
							/>
						</marker>
					</defs>
					{[
						["Next.js UI", 40, 80],
						["Convex API", 250, 80],
						["Auth / RBAC", 460, 30],
						["RAG + AI", 460, 130],
						["Convex DB", 700, 80],
					].map(([label, x, y]) => (
						<g key={label}>
							<rect
								x={Number(x)}
								y={Number(y)}
								width="170"
								height="70"
								rx="10"
								className="fill-muted stroke-border"
							/>
							<text
								x={Number(x) + 85}
								y={Number(y) + 42}
								textAnchor="middle"
								className="fill-foreground text-sm font-medium"
							>
								{label}
							</text>
						</g>
					))}
					{[
						[210, 115, 250, 115],
						[420, 115, 460, 65],
						[420, 115, 460, 165],
						[630, 65, 700, 115],
						[630, 165, 700, 115],
					].map(([x1, y1, x2, y2]) => (
						<line
							key={`${x1}-${y1}-${x2}-${y2}`}
							x1={x1}
							y1={y1}
							x2={x2}
							y2={y2}
							className="stroke-foreground"
							strokeWidth="2"
							markerEnd="url(#arrow)"
						/>
					))}
				</svg>
			</CardContent>
		</Card>
	);
}

function DataFlowDiagram() {
	const steps = [
		"Input",
		"Authorize",
		"RAG Search",
		"AI Output",
		"Score",
		"Report",
		"Feedback",
	];

	return (
		<Card
			id="data-flow-diagram"
			className="scroll-mt-20 rounded-lg"
		>
			<CardHeader>
				<CardTitle>Data Flow Diagram</CardTitle>
				<CardDescription>
					Content moves from user input to AI-assisted report output.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3 md:grid-cols-7">
					{steps.map((step, index) => (
						<div
							key={step}
							className="rounded-lg border bg-muted/30 p-3 text-center"
						>
							<p className="mx-auto mb-2 flex size-7 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
								{index + 1}
							</p>
							<p className="text-sm font-medium">{step}</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function TeamCard({
	member,
}: {
	member: {
		fullName: string;
		role: string;
		email: string;
		imageUrl: string;
	};
}) {
	const initials = member.fullName
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className="rounded-lg border bg-card p-4">
			<div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
				{member.imageUrl ? (
					<div
						role="img"
						aria-label={member.fullName}
						className="size-full bg-cover bg-center"
						style={{ backgroundImage: `url(${member.imageUrl})` }}
					/>
				) : (
					<div className="flex size-full items-center justify-center text-3xl font-semibold text-muted-foreground">
						{initials || "TM"}
					</div>
				)}
			</div>
			<h3 className="mt-4 font-medium">{member.fullName}</h3>
			<p className="text-sm text-muted-foreground">{member.role}</p>
			<p className="mt-2 break-all text-sm text-muted-foreground">
				{member.email}
			</p>
		</div>
	);
}

export function DocsPageClient() {
	const docsState = useQuery(api.docs.getPublicDocsState);
	const [query, setQuery] = useState("");

	const visiblePitchSections = useMemo(
		() => pitchSections.filter((section) => sectionMatches(section, query)),
		[query],
	);
	const visibleTechnicalSections = useMemo(
		() => technicalSections.filter((section) => sectionMatches(section, query)),
		[query],
	);

	if (docsState === undefined) {
		return (
			<main className="mx-auto max-w-6xl p-6">
				<LoadingState label="Loading docs" />
			</main>
		);
	}

	if (!docsState.availability.isAvailable || !docsState.stats) {
		return (
			<main className="mx-auto flex min-h-svh max-w-2xl items-center p-6">
				<Alert>
					<Lock className="size-4" />
					<AlertTitle>Docs Not Available</AlertTitle>
					<AlertDescription>
						This documentation showcase is controlled by Convex environment
						variables. Current mode is{" "}
						<span className="font-medium">{docsState.availability.mode}</span>.
						The default window is{" "}
						{formatDateTime(docsState.availability.startAt)} to{" "}
						{formatDateTime(docsState.availability.endAt)}.
					</AlertDescription>
				</Alert>
			</main>
		);
	}

	const markdown = buildMarkdown({
		stats: docsState.stats,
		teamName: docsState.team.name,
		teamMembers: docsState.team.members,
	});

	return (
		<main className="min-h-svh bg-background">
			<section className="border-b">
				<div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
					<div>
						<Badge variant="outline">Live Docs</Badge>
						<h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
							Narrative Guard
						</h1>
						<p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
							A YC-style pitch deck, engineering whitepaper, and live system
							snapshot for the AI brand governance platform.
						</p>
						<div className="mt-6 flex flex-wrap gap-2">
							<Button
								variant="outline"
								onClick={() => downloadMarkdown(markdown)}
							>
								<FileText data-icon="inline-start" />
								Export Markdown
							</Button>
							<div className="inline-flex items-center gap-2 rounded-lg border bg-card px-2">
								<Share2 className="size-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">Share</span>
								<CopyButton
									content={
										typeof window === "undefined"
											? "/docs"
											: window.location.href
									}
								/>
							</div>
						</div>
					</div>
					<Card className="rounded-lg">
						<CardHeader>
							<CardTitle>Publishing Window</CardTitle>
							<CardDescription>
								Controlled by Convex environment variables.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex items-center gap-2">
								<CalendarClock className="size-4 text-muted-foreground" />
								<Badge>{docsState.availability.mode}</Badge>
							</div>
							<p>Start: {formatDateTime(docsState.availability.startAt)}</p>
							<p>End: {formatDateTime(docsState.availability.endAt)}</p>
						</CardContent>
					</Card>
				</div>
			</section>

			<div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[260px_minmax(0,1fr)]">
				<aside className="lg:sticky lg:top-4 lg:max-h-[calc(100svh-2rem)] lg:self-start">
					<Card className="rounded-lg lg:max-h-[calc(100svh-2rem)] lg:overflow-hidden">
						<CardContent className="flex flex-col gap-4 p-4 lg:max-h-[calc(100svh-2rem)]">
							<label className="relative block shrink-0">
								<span className="sr-only">Search docs</span>
								<Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
								<Input
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									placeholder="Search docs"
									className="pl-8"
								/>
							</label>
							<nav className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 text-sm">
								{navigationGroups.map((group) => (
									<div key={group.label}>
										<p className="mb-2 font-medium">{group.label}</p>
										<div className="grid gap-1">
											{group.ids.map((id) => {
												const section =
													[...pitchSections, ...technicalSections].find(
														(item) => item.id === id,
													) ?? null;

												return (
													<a
														key={id}
														href={`#${id}`}
														className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
													>
														{section?.title ?? "Team"}
													</a>
												);
											})}
											<a
												href="#architecture-diagram"
												className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
											>
												Architecture diagram
											</a>
											<a
												href="#data-flow-diagram"
												className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
											>
												Data flow diagram
											</a>
										</div>
									</div>
								))}
							</nav>
						</CardContent>
					</Card>
				</aside>

				<div className="space-y-8">
					<section
						id="live-system"
						className="scroll-mt-20"
					>
						<div className="grid gap-3 md:grid-cols-4">
							<StatCard
								label="Users"
								value={docsState.stats.users}
							/>
							<StatCard
								label="Workspaces"
								value={docsState.stats.workspaces}
							/>
							<StatCard
								label="Brands"
								value={docsState.stats.brands}
							/>
							<StatCard
								label="Avg. Score"
								value={docsState.stats.averageScore}
							/>
							<StatCard
								label="Reports"
								value={docsState.stats.reports}
							/>
							<StatCard
								label="Completed"
								value={docsState.stats.completedReports}
							/>
							<StatCard
								label="Findings"
								value={docsState.stats.findings}
							/>
							<StatCard
								label="Pending Invites"
								value={docsState.stats.pendingInvites}
							/>
						</div>
					</section>

					<section className="space-y-4">
						<div>
							<Badge variant="outline">YC-style deck</Badge>
							<h2 className="mt-2 text-2xl font-semibold">Pitch Deck</h2>
						</div>
						{visiblePitchSections.map((section) => (
							<SectionCard
								key={section.id}
								section={section}
							/>
						))}
					</section>

					<Card
						id="team"
						className="scroll-mt-20 rounded-lg"
					>
						<CardHeader>
							<Badge className="w-fit">Team</Badge>
							<CardTitle>{docsState.team.name}</CardTitle>
							<CardDescription>
								Uniform team cards for judging, investor review, and public
								showcase windows.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{docsState.team.members.map((member) => (
									<TeamCard
										key={`${member.email}-${member.fullName}`}
										member={member}
									/>
								))}
							</div>
						</CardContent>
					</Card>

					<section className="space-y-4">
						<div>
							<Badge variant="outline">Engineering</Badge>
							<h2 className="mt-2 text-2xl font-semibold">
								Technical Documentation
							</h2>
						</div>

						<Card className="rounded-lg">
							<CardHeader>
								<CardTitle>Feature Matrix</CardTitle>
								<CardDescription>
									Current, upcoming, and planned feature state.
								</CardDescription>
							</CardHeader>
							<CardContent className="grid gap-2">
								{featureRows.map(([feature, status, detail]) => (
									<div
										key={feature}
										className="grid gap-2 rounded-lg border p-3 md:grid-cols-[180px_120px_1fr]"
									>
										<p className="font-medium">{feature}</p>
										<Badge
											variant={status === "Current" ? "default" : "outline"}
											className="w-fit"
										>
											{status}
										</Badge>
										<p className="text-sm text-muted-foreground">{detail}</p>
									</div>
								))}
							</CardContent>
						</Card>

						<ArchitectureSvg />
						<DataFlowDiagram />

						{visibleTechnicalSections.map((section) => (
							<SectionCard
								key={section.id}
								section={section}
							/>
						))}
					</section>
				</div>
			</div>
		</main>
	);
}
