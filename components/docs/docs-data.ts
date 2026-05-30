export type DocsSection = {
	id: string;
	title: string;
	kicker: string;
	summary: string;
	items: string[];
};

export const pitchSections: DocsSection[] = [
	{
		id: "problem",
		title: "Problem",
		kicker: "YC Deck",
		summary:
			"Teams publish fast, but brand rules live in scattered docs and review habits. Content slips through with risky claims, inconsistent tone, and off-policy language.",
		items: [
			"Brand review is slow and manual.",
			"Teams lack a shared source of truth during content review.",
			"AI-written content increases volume and inconsistency.",
		],
	},
	{
		id: "solution",
		title: "Solution",
		kicker: "YC Deck",
		summary:
			"Narrative Guard audits content against a workspace's Brand Constitution and returns a score, verdict, rewrite, findings, and evidence-backed recommendations.",
		items: [
			"Create a brand constitution once.",
			"Audit content by format.",
			"Review explainable reports with deterministic scoring.",
		],
	},
	{
		id: "why-now",
		title: "Why Now",
		kicker: "YC Deck",
		summary:
			"Marketing teams are adopting AI writing tools faster than review processes can adapt. The gap between content volume and brand governance is widening.",
		items: [
			"AI increases draft volume.",
			"Remote teams need shared review standards.",
			"Trust and claim safety are now board-level brand risks.",
		],
	},
	{
		id: "product-demo",
		title: "Product Demo",
		kicker: "YC Deck",
		summary:
			"The product flow is workspace, brand, audit, report, re-audit. Reports can be downloaded and history can be searched.",
		items: [
			"Workspace-scoped dashboard.",
			"Brand Constitution with RAG indexing.",
			"AI audit with rewrite, findings, issue types, and score breakdown.",
		],
	},
	{
		id: "market",
		title: "Market Opportunity",
		kicker: "YC Deck",
		summary:
			"The initial market is brand and marketing teams that publish high volumes of social, website, email, ad, and press content.",
		items: [
			"Marketing review workflows.",
			"Brand governance.",
			"AI content quality control.",
		],
	},
	{
		id: "business-model",
		title: "Business Model",
		kicker: "YC Deck",
		summary:
			"The natural model is workspace-based SaaS pricing with limits around seats, brands, audits, history retention, and advanced analytics.",
		items: [
			"Free/internal beta for validation.",
			"Paid workspaces by seat and usage.",
			"Enterprise plans for governance, analytics, and integrations.",
		],
	},
	{
		id: "traction",
		title: "Traction",
		kicker: "YC Deck",
		summary:
			"The current product has core P1 functionality implemented: auth, teams, brands, RAG indexing, audits, scoring, reports, history, PDF export, and docs.",
		items: [
			"Functional workspace collaboration.",
			"AI/RAG audit pipeline implemented.",
			"Scoring guide and manual QA docs available.",
		],
	},
	{
		id: "competition",
		title: "Competition",
		kicker: "YC Deck",
		summary:
			"Alternatives include generic AI writing tools, grammar tools, compliance review tools, and manual brand review. Narrative Guard focuses on brand-specific evidence and team governance.",
		items: [
			"Generic tools do not know internal brand rules.",
			"Manual review does not scale.",
			"Compliance tools are often too narrow for brand voice.",
		],
	},
	{
		id: "advantage",
		title: "Unique Advantage",
		kicker: "YC Deck",
		summary:
			"The advantage is combining workspace permissions, brand-specific RAG, content-type-aware scoring, explainable findings, and exportable reports.",
		items: [
			"One Brand Constitution becomes reusable review memory.",
			"Scores are deterministic after AI extracts dimensions/findings.",
			"Reports are built for team review, not just one-off AI output.",
		],
	},
	{
		id: "go-to-market",
		title: "Go-To-Market",
		kicker: "YC Deck",
		summary:
			"Start with founder-led sales and design partners in marketing teams, agencies, and AI-heavy content teams.",
		items: [
			"Pilot with content teams already using AI.",
			"Use report exports as shareable proof.",
			"Expand through workspace invites and brand portfolios.",
		],
	},
	{
		id: "vision",
		title: "Vision",
		kicker: "YC Deck",
		summary:
			"Become the brand governance layer for every piece of AI-assisted content before it reaches the public.",
		items: [
			"Audit before publishing.",
			"Learn from feedback and outcomes.",
			"Connect to content sources and publishing systems.",
		],
	},
];

export const technicalSections: DocsSection[] = [
	{
		id: "product-overview",
		title: "Product Overview",
		kicker: "Product",
		summary:
			"Narrative Guard helps workspaces create Brand Constitutions, audit content, review reports, and manage access through owner/admin/member roles.",
		items: [
			"Target users: marketing teams, founders, brand managers, writers, editors, agencies.",
			"Core use cases: brand review, claim safety, content rewrite, audit history, team governance.",
			"Current outputs: score, verdict, summary, rewrite, findings, evidence, score breakdown, PDF.",
		],
	},
	{
		id: "feature-matrix",
		title: "Feature Matrix",
		kicker: "Live System",
		summary:
			"Current features are implemented in the application. Upcoming and planned items are product roadmap candidates.",
		items: [
			"Current: auth, workspaces, roles, invites, brand setup, RAG indexing, audits, reports, history filters, PDF export.",
			"Upcoming: automated tests, analytics, retry flows, email invites, owner transfer.",
			"Planned: integrations, public sharing, billing, batch audits, configurable policies.",
		],
	},
	{
		id: "architecture",
		title: "Architecture Diagram",
		kicker: "Engineering",
		summary:
			"The app is a Next.js frontend with Convex as backend, database, auth, scheduled processing, and RAG/AI orchestration layer.",
		items: [
			"UI: Next.js App Router, React, shadcn/ui, Tailwind.",
			"API: Convex generated queries/mutations/actions.",
			"Services: Convex Auth, @convex-dev/rag, AI SDK, Google Gemini.",
			"Data: Convex tables for workspaces, members, invites, brands, reports, findings.",
		],
	},
	{
		id: "data-flow",
		title: "Data Flow Diagram",
		kicker: "Engineering",
		summary:
			"Submitted content flows through workspace authorization, brand/RAG lookup, AI generation, deterministic scoring, and saved report output.",
		items: [
			"Input: user, workspace, brand, content type, content.",
			"Processing: authorize membership, fetch brand, search RAG.",
			"AI: generate structured dimensions, findings, rewrite, summary.",
			"Output: save report/findings, route to report detail, allow re-audit/export.",
		],
	},
	{
		id: "technology",
		title: "Technology Stack",
		kicker: "Engineering",
		summary:
			"The stack is optimized for a typed full-stack product with real-time backend state and a compact internal-tool UI.",
		items: [
			"Frontend: Next.js, React, TypeScript, Tailwind, shadcn/ui.",
			"Backend: Convex, Convex Auth, Convex database.",
			"AI: Google Gemini, AI SDK, @convex-dev/rag.",
			"Infra/tooling: Bun, ESLint, Convex codegen.",
		],
	},
	{
		id: "api",
		title: "API Documentation",
		kicker: "Engineering",
		summary:
			"The frontend calls Convex functions through generated API references. Authorization is enforced inside Convex functions.",
		items: [
			"brand: create, update, get, list, RAG ingestion internals.",
			"audit: create manual audit, process audit, complete/fail audit internals.",
			"report: list, get with findings, dashboard stats, brand health, delete.",
			"workspace: list, create, rename, members, invites, accept, revoke, roles, remove.",
			"docs: public availability state and live aggregate stats.",
		],
	},
	{
		id: "data-layer",
		title: "Data Layer",
		kicker: "Engineering",
		summary:
			"Convex tables store workspace, brand, report, and finding state. RAG component tables store indexed constitution data.",
		items: [
			"Primary tables: workspaces, workspaceMembers, workspaceInvites, brands, auditReports, auditFindings.",
			"Auth tables are owned by @convex-dev/auth.",
			"RAG tables are owned by @convex-dev/rag.",
			"No scraping/parsing pipeline is implemented in P1.",
		],
	},
	{
		id: "ai-layer",
		title: "AI Layer",
		kicker: "Engineering",
		summary:
			"The AI layer uses Brand Constitution RAG context plus content-type policy instructions to generate structured audit data.",
		items: [
			"Embedding model: gemini-embedding-001.",
			"Generation model: gemini-2.5-flash.",
			"RAG search: hybrid search with nearby chunk context.",
			"Explainability: findings include sentence, reason, evidence, severity, issue type.",
		],
	},
	{
		id: "roadmap",
		title: "Product Roadmap",
		kicker: "Product",
		summary:
			"The immediate roadmap is reliability and analytics before deeper integrations.",
		items: [
			"Short term: tests, analytics, retry support.",
			"Mid term: email invites, owner transfer, report comparison.",
			"Long term: integrations, public sharing, billing, configurable policies.",
		],
	},
	{
		id: "performance",
		title: "Performance & Scalability",
		kicker: "Engineering",
		summary:
			"The current implementation uses indexed Convex queries and paginated history. Future scale should add denormalized counters and more aggregate tables.",
		items: [
			"History is paginated.",
			"Report/finding data is separated to avoid unbounded documents.",
			"Docs live stats use bounded samples and should become counters at scale.",
			"Heavy report export renders only when needed.",
		],
	},
	{
		id: "security",
		title: "Security",
		kicker: "Engineering",
		summary:
			"Security relies on Google auth, Convex server-side identity, workspace membership checks, role checks, and hashed invite tokens.",
		items: [
			"Protected app routes require auth.",
			"Workspace data is checked server-side.",
			"Invite raw tokens are not stored.",
			"Maintenance wipe requires env enablement, token, and confirmation.",
		],
	},
	{
		id: "analytics",
		title: "Analytics",
		kicker: "Live System",
		summary:
			"Current analytics are basic dashboard/report aggregates. Deeper trend analytics are planned.",
		items: [
			"Current: total reports, average score, verdict counts, brand health.",
			"Live docs: aggregate counts for users, workspaces, brands, reports, findings.",
			"Planned: score trends, issue type frequency, finding analytics by user/brand/content type.",
		],
	},
	{
		id: "changelog",
		title: "Changelog",
		kicker: "Operations",
		summary:
			"Current version includes P1 collaboration and audit functionality.",
		items: [
			"v0.1: landing page, auth, brand setup, RAG indexing, AI audit reports.",
			"v0.2: scoring guide, report history filters, PDF export, re-audit.",
			"v0.3: workspaces, team roles, invites, permission-aware UI, live docs.",
		],
	},
];

export const featureRows = [
	["Authentication", "Current", "Google OAuth with Convex Auth"],
	["Workspaces", "Current", "Default/create/switch/rename"],
	["Teams", "Current", "Owner/admin/member roles and invite links"],
	["Brand setup", "Current", "Create/edit/read constitution with RAG status"],
	["AI audits", "Current", "RAG + Gemini + deterministic scoring"],
	["History", "Current", "Search, filters, pagination, row actions"],
	["Report export", "Current", "Print/PDF export via browser"],
	["Analytics", "Upcoming", "Trends by brand, user, issue type"],
	["Retry", "Upcoming", "Failed audit/RAG retry controls"],
	["Integrations", "Planned", "Social, CMS, docs, publishing systems"],
] as const;

export const navigationGroups = [
	{ label: "Pitch", ids: pitchSections.map((section) => section.id) },
	{ label: "Technical", ids: technicalSections.map((section) => section.id) },
	{ label: "Team", ids: ["team"] },
] as const;
