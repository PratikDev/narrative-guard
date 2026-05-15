You are building the frontend only for a project called NarrativeGuard.

NarrativeGuard is an AI brand voice coherence tool for business users. It helps a team define a brand’s rules, paste text content before publishing, and receive a brand-coherence report with a score, verdict, flagged sentences, reasons, and a suggested rewrite.

This task is frontend-only.
Do not implement backend logic.
Do not create API routes, Convex functions, server actions, scraping, notifications, alerts, auth, billing, AI calls, or real persistence.
Use mock/static data and local React state where needed.
The backend will be added later.

Tech stack:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

Use shadcn/ui as much as possible:
- Button
- Card
- Input
- Textarea
- Select
- Badge
- Tabs
- Separator
- Progress
- Table
- Alert
- Skeleton
- Tooltip
- Dialog/Sheet only if useful

Brand colors:
- Primary: #CCD5AE
- Secondary: #E9EDC9
- Tertiary: #FEFAE0
- Accent/touch color: #FAEDCD

Important color rule:
Do not hardcode these brand colors directly in component Tailwind classes.
Declare them as CSS variables in `globals.css`.
Reference them through Tailwind/shadcn-compatible variables or semantic tokens.
Use shadcn theming conventions as much as possible.

Design direction:
The UI should be clean, calm, professional, and business-facing.
Target users are marketers, founders, brand managers, content reviewers, and communications teams.
Avoid playful, decorative, consumer-style UI.
Avoid oversized marketing hero sections.
Build an actual app interface, not a landing page.
Prioritize clarity, trust, readability, and efficient workflows.
Use restrained spacing, good typography, clear hierarchy, and polished empty/loading/result states.
Use brand colors subtly for backgrounds, accents, borders, selected states, and status panels.
Ensure mobile responsiveness.
Ensure text does not overflow buttons, cards, tables, or badges.

Phase 1 product scope:
- Brand setup
- Brand Constitution input as one long text field
- Brand selection
- Manual text content audit
- Content type selection
- Brand coherence score
- Verdict: On Brand, Needs Review, Off Brand
- Flagged sentences
- Reasons for each flag
- Suggested rewrite
- Original vs rewritten content view
- Dimension score breakdown
- Automatic mock report creation after audit
- Report history
- Report detail page
- Basic dashboard summary
- Empty, loading, success, and error states
- Mock/demo data only

Do not build:
- Monitoring targets
- Scraping
- RSS/social/website monitoring
- Slack alerts
- Alert thresholds
- Scheduled audits
- Notifications
- File uploads
- Team permissions
- External integrations
- Backend logic

Routes to build:

1. `/`
Dashboard page.

Sections:
- Overview stats:
  - Total audits
  - Average score
  - Needs review count
  - Off-brand count
- Quick actions:
  - Create brand
  - Run audit
- Recent reports:
  - Brand name
  - Content type
  - Score
  - Verdict
  - Date
  - Open report action
- Brand health summary:
  - Brand name
  - Average score
  - Latest verdict
  - Number of reports

2. `/setup`
Brand setup page.

Sections:
- Page header: “Brand Setup”
- Brand details:
  - Brand name input
- Brand Constitution:
  - One large textarea for the full rules
  - Helper text explaining users can include tone, messaging pillars, banned phrases, approved examples, and audience notes
- Save button
- Mock loading/success/error states
- Constitution preview showing the saved/pasted constitution in a readable panel

Do not create a structured constitution form. It should be a single long text input.

3. `/audit`
Manual content audit page.

Sections:
- Page header: “Content Audit”
- Audit setup:
  - Brand selector
  - Content type selector
  - Content textarea
- Analyze action:
  - Analyze button
  - Mock processing/loading state
  - Error state
- Current report result:
  - Overall score
  - Verdict badge
  - Short summary
  - Dimension score breakdown
  - Flagged sentences and reasons
  - Original vs rewritten content
  - Suggested rewrite

Content type options:
- Generic text
- Social post
- Website copy
- Email
- Press release
- Ad copy

4. `/history`
Report history page.

Sections:
- Page header: “Report History”
- Filters/search:
  - Search by brand or content
  - Filter by verdict
  - Filter by content type
- Reports table/list:
  - Brand name
  - Content type
  - Score
  - Verdict
  - Summary
  - Date
  - Open report action
- Empty state:
  - No reports yet
  - CTA to run first audit

5. `/reports/[reportId]`
Report detail page.

Sections:
- Report header:
  - Brand name
  - Content type
  - Date
  - Overall score
  - Verdict
- Submitted content:
  - Original text
- Score breakdown:
  - Tone alignment
  - Messaging alignment
  - Banned phrase safety
  - Audience fit
  - Clarity and trust
- Findings:
  - Flagged sentences
  - Reason for each flag
- Rewrite:
  - Suggested rewrite
  - Original vs rewritten comparison
- Navigation:
  - Back to history
  - Run another audit button

Navigation:
Create a simple app shell with nav links:
- Dashboard
- Setup
- Audit
- History

Suggested file/component structure:
- `components/layout/AppShell.tsx`
- `components/layout/AppNav.tsx`
- `components/shared/PageHeader.tsx`
- `components/shared/StatusBadge.tsx`
- `components/shared/ScoreDisplay.tsx`
- `components/shared/EmptyState.tsx`
- `components/shared/LoadingState.tsx`
- `components/shared/MetricCard.tsx`
- `components/brands/BrandSelector.tsx`
- `components/brands/BrandConstitutionPreview.tsx`
- `components/audit/AuditForm.tsx`
- `components/audit/AuditResult.tsx`
- `components/audit/DimensionScores.tsx`
- `components/audit/FlaggedSentenceList.tsx`
- `components/audit/RewritePanel.tsx`
- `components/audit/OriginalRewriteComparison.tsx`
- `components/history/ReportHistoryTable.tsx`
- `components/reports/ReportDetail.tsx`
- `components/dashboard/DashboardStats.tsx`
- `components/dashboard/RecentReports.tsx`
- `components/dashboard/BrandHealthSummary.tsx`
- `lib/types.ts`
- `lib/mock-data.ts`
- `lib/score.ts`
- `lib/format.ts`
- `lib/constants.ts`

Maintainability rules:
Do not make any file too big.
Split files by responsibility.
Components should focus on rendering and local interaction state.
Shared logic should live in utility files.
Mock data should live in `lib/mock-data.ts`.
Types should live in `lib/types.ts`.
Formatting helpers should live in `lib/format.ts`.
Score/verdict helpers should live in `lib/score.ts`.
Constants and labels should live in `lib/constants.ts`.
Do not duplicate verdict labels, content type labels, score color rules, or dimension labels across components.

Use these TypeScript types in `lib/types.ts`:

```ts
export type Id = string;

export type Verdict = "on_brand" | "needs_review" | "off_brand";

export type ContentType =
  | "generic"
  | "social_post"
  | "website_copy"
  | "email"
  | "press_release"
  | "ad_copy";

export type AuditStatus = "idle" | "processing" | "complete" | "failed";

export type ScoreDimension =
  | "toneAlignment"
  | "messagingAlignment"
  | "bannedPhraseSafety"
  | "audienceFit"
  | "clarityAndTrust";

export type Brand = {
  id: Id;
  name: string;
  constitution: string;
  createdAt: string;
  updatedAt: string;
};

export type DimensionScores = Record<ScoreDimension, number>;

export type FlaggedSentence = {
  id: Id;
  sentence: string;
  reason: string;
  severity: "low" | "medium" | "high";
};

export type AuditReport = {
  id: Id;
  brandId: Id;
  brandName: string;
  contentType: ContentType;
  originalContent: string;
  score: number;
  verdict: Verdict;
  summary: string;
  dimensionScores: DimensionScores;
  flaggedSentences: FlaggedSentence[];
  rewriteSuggestion: string;
  status: AuditStatus;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  totalReports: number;
  averageScore: number;
  needsReviewCount: number;
  offBrandCount: number;
  onBrandCount: number;
};

export type BrandFormValues = {
  name: string;
  constitution: string;
};

export type AuditFormValues = {
  brandId: Id;
  contentType: ContentType;
  content: string;
};
```

Use these frontend labels in `lib/constants.ts`:

```ts
import type { ContentType, ScoreDimension, Verdict } from "./types";

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  generic: "Generic text",
  social_post: "Social post",
  website_copy: "Website copy",
  email: "Email",
  press_release: "Press release",
  ad_copy: "Ad copy",
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  on_brand: "On Brand",
  needs_review: "Needs Review",
  off_brand: "Off Brand",
};

export const SCORE_DIMENSION_LABELS: Record<ScoreDimension, string> = {
  toneAlignment: "Tone alignment",
  messagingAlignment: "Messaging alignment",
  bannedPhraseSafety: "Banned phrase safety",
  audienceFit: "Audience fit",
  clarityAndTrust: "Clarity and trust",
};
```

Mock data:
Create realistic business-facing sample data.
Include at least:
- 3 brands
- 6 reports
- A mix of verdicts
- A mix of content types
- Dimension scores
- Flagged sentences with reasons
- Rewrite suggestions

Frontend behavior:
- `/setup` can mock-save a brand in local state for the session or simply show success state.
- `/audit` should simulate analysis with a loading state and then show a mock result.
- The report generated on `/audit` can be mock/static, but it should look realistic and match the selected brand/content type where possible.
- `/history` and `/reports/[reportId]` should use mock reports.
- Handle missing report IDs with a clean empty/not-found state.

Design expectations:
- Use `Card` for meaningful grouped areas only.
- Avoid cards inside cards.
- Use `Badge` for verdicts.
- Use `Progress` or compact bars for dimension scores.
- Use a large clean numeric display for overall score.
- Use subtle highlighting for flagged sentences.
- Original vs rewrite comparison should be easy to scan.
- Business users should immediately understand what to do next.

Final deliverable:
A polished, maintainable frontend-only Phase 1 app for NarrativeGuard, using mock data and shadcn/ui, with clean routing, reusable components, typed data structures, and no backend implementation.