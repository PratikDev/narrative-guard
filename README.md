# Narrative Guard

Narrative Guard is a workspace-based brand governance app for teams that need to review written content before it is published. Teams define a Brand Constitution, index it with Convex RAG, then audit drafts against that source of truth to get a score, verdict, rewrite, findings, evidence, and a saved report.

The app is built with Next.js App Router, React, TypeScript, Convex, Convex Auth, `@convex-dev/rag`, Google Gemini, shadcn/ui, Tailwind CSS, TanStack React Table, Recharts, and Bun.

## What It Does

Narrative Guard helps marketing, brand, content, agency, and founder-led teams answer one question: does this content follow our brand rules?

Users can:

- Sign in with Google.
- Create and switch between workspaces.
- Invite teammates with owner, admin, and member roles.
- Create brand profiles with detailed Brand Constitutions.
- Automatically index Brand Constitutions into brand-specific RAG namespaces.
- Save content audit drafts before running an audit.
- Audit generic text, social posts, website copy, email, press releases, and ad copy.
- Generate AI-assisted reports with deterministic backend scoring.
- Review scores, verdicts, summaries, rewrites, findings, evidence, severity, issue types, and score dimensions.
- Re-audit rewritten content from a completed report.
- Retry failed audits.
- Download or print completed reports as PDFs.
- Search, filter, paginate, and manage report history.
- Review workspace analytics, risky audits, score trends, verdict distribution, content type performance, brand comparison, and member activity.
- View public product docs, scoring docs, and live pitch/demo stats when docs visibility is enabled.

## Feature Overview

### Authentication

Authentication uses `@convex-dev/auth` with Google OAuth.

- Public routes remain available without login.
- Protected app routes require a signed-in Convex Auth session.
- Signed-in users are redirected away from `/signin`.
- Backend functions derive the user from Convex auth state.
- Client-provided user IDs are not trusted for authorization.

### Workspaces

Workspaces are the top-level collaboration boundary.

- A default workspace is created when a signed-in user needs one.
- Users can create additional workspaces from the sidebar workspace switcher.
- Active workspace selection is stored client-side and applied across dashboard, setup, audit, history, reports, team, and analytics pages.
- Owners can rename workspaces.
- Workspace deletion and owner transfer are not currently implemented.

### Roles And Permissions

The role model has three roles:

- `owner`: can manage workspace settings, admins, members, invites, brands, audits, reports, and report deletion.
- `admin`: can invite/remove members, manage brands, run audits, view analytics, delete reports, and download reports.
- `member`: can read brand constitutions, run audits, view dashboard/history/reports/team/analytics, and download reports.

The frontend hides unavailable actions, but Convex authorization helpers enforce permissions server-side.

### Team Management

The team page supports collaboration workflows:

- View active workspace members.
- See current user role.
- Read role guidance.
- Invite admins or members according to role permissions.
- Generate invite links for manual sharing.
- Accept invite links at `/invite/[token]`.
- Accept or decline pending invitations from in-app notification flows.
- Revoke pending invites.
- Change admin/member roles as an owner.
- Remove admins or members according to role permissions.
- Block duplicate pending invites and invites for existing active members.
- Expire stale invites.

### Notifications

The app includes user notifications for collaboration and audit events.

- Audit completed.
- Audit failed.
- Workspace invitation received.
- Workspace invitation accepted.
- Workspace role changed.
- Read/unread state and unread counts.
- Mark one or all notifications as read.

### Brand Management

Brands belong to workspaces.

- Owners and admins can create and edit brands.
- Members can read Brand Constitutions.
- Each brand stores a name, constitution, workspace, creator, timestamps, RAG status, RAG entry ID, RAG indexed time, and optional RAG error.
- Brand Constitution changes are versioned in `brandConstitutionVersions`.
- Version history and version previews are available in the UI.
- Updating a constitution schedules RAG re-indexing.
- Brand deletion is not currently implemented.

### RAG Indexing

RAG is powered by `@convex-dev/rag`.

- Each brand has a namespace in the format `brand:<brandId>`.
- The constitution is indexed with the stable key `brand-constitution`.
- Embeddings use Google `gemini-embedding-001`.
- Embeddings are configured at 1536 dimensions.
- Updating a Brand Constitution replaces the previous RAG entry.
- Audits search the selected brand namespace using hybrid search.
- RAG component tables are treated as implementation details.

### Audits

The audit flow supports manual content review.

- Select a ready brand.
- Choose a content type.
- Paste content.
- Optionally save the work as a draft.
- Submit an audit.
- Convex creates a processing report immediately.
- A scheduled internal action retrieves brand context from RAG.
- Gemini generates structured audit data.
- Convex applies deterministic score calculation, score caps, verdict assignment, and persistence.
- Completed reports include findings and score dimensions.
- Failed reports store a failed status and error message.

Supported content types:

- Generic text
- Social post
- Website copy
- Email
- Press release
- Ad copy

### Audit Drafts

Audit drafts let teams prepare content before running checks.

- Save draft title, brand, content type, and content.
- List workspace drafts from the audit form.
- Show recent drafts on the dashboard.
- Edit active drafts.
- Discard drafts.
- Run an audit directly from a draft.
- Mark drafts as audited after report creation.

### Reports

Reports are saved audit outputs.

Completed report detail pages include:

- Brand name.
- Content type.
- Created date.
- Final score.
- Verdict.
- Summary.
- Original content and rewrite.
- Diff-style original/rewrite comparison.
- Copy rewritten content action.
- Findings accordion.
- Score breakdown accordion.
- Download/print action.
- Re-audit action.
- Delete action for owner/admin.

Processing and failed reports show status-specific alerts. Failed audits can be retried when the selected brand is ready.

### PDF Export

Completed reports can be downloaded through the browser print/PDF flow.

The printable report includes:

- Report metadata.
- Score and verdict.
- Summary.
- Original and rewritten content.
- Findings.
- Score breakdown.

The print layout intentionally excludes interactive UI controls and diff widgets.

### History

History is implemented with TanStack React Table and Convex pagination.

- Search by brand, content, and summary.
- Filter by verdict.
- Filter by content type.
- Infinite load-more behavior near the bottom of the page.
- Open reports from history.
- Download completed reports.
- Delete reports as owner/admin.

### Dashboard

The workspace dashboard summarizes operational state.

- Total reports.
- Average score.
- Verdict counts.
- Recent reports.
- Brand health summary.
- Latest report links.
- Pending invitations.
- Pending drafts.
- Create brand action for owner/admin.
- Run audit action.

### Analytics

The analytics page gives workspace-level insight into audit performance.

- Date filters for last 7 days, last 30 days, last 90 days, and all time.
- Brand, content type, and member filters.
- Summary cards with current and previous period comparison.
- Score trend chart.
- Audit volume chart.
- Verdict distribution chart.
- Score dimension radar chart.
- Issue type breakdown.
- Severity breakdown.
- Content type performance chart.
- Brand comparison chart.
- Member activity table.
- Risky audits table for off-brand or low-scoring content.

### Scoring Guide

The public scoring guide explains the scoring system in non-technical terms.

- Final score formula.
- Verdict thresholds.
- Content-type policy tabs.
- Issue type reference.
- Base penalty table.
- Worked scoring example.
- Score floors and caps.

### Public Docs

The `/docs` route is a public product and technical documentation surface.

- Availability is controlled by `DOCS_PUBLIC_VISIBILITY`.
- Scheduled availability can be configured with start/end timestamps or duration.
- Team metadata can be configured with `DOCS_TEAM_JSON`.
- When available, docs show sampled live aggregate stats from Convex.
- Docs include YC-style pitch sections and technical architecture sections.

### Maintenance Utilities

Development/admin maintenance actions exist in `convex/maintenance.ts`.

- Wipe app data in batches.
- Wipe auth-related data.
- Wipe workspace and brand/report data.
- Wipe RAG namespaces.
- Backfill older audit findings with an issue type.

These actions are disabled unless `ENABLE_WIPE_ALL_DATA=true` and a matching `WIPE_ALL_DATA_TOKEN` are configured.

## Routes

Public routes:

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/signin` | Google sign-in page |
| `/scoring` | Public scoring guide |
| `/docs` | Public product, pitch, and technical docs |

Authenticated routes:

| Route | Purpose |
| --- | --- |
| `/dashboard` | Workspace overview, stats, drafts, invites, recent reports |
| `/setup` | Brand list and brand creation |
| `/setup/[brandId]` | Brand edit, read-only constitution view, version history |
| `/audit` | Manual audit form and drafts panel |
| `/history` | Searchable/filterable report history |
| `/reports/[reportId]` | Report detail, retry, re-audit, delete, print |
| `/team` | Members, invites, roles, workspace settings |
| `/analytics` | Workspace analytics |
| `/invite/[token]` | Workspace invite acceptance |

## Scoring Model

The AI model returns structured dimension scores and findings. Convex then calculates the final score deterministically.

Verdicts:

| Score | Verdict | Meaning |
| ---: | --- | --- |
| 80-100 | `on_brand` | Content is aligned and generally safe to publish |
| 50-79 | `needs_review` | Content has drift or risk that should be reviewed |
| 0-49 | `off_brand` | Content materially conflicts with brand rules or claim safety |

Dimensions:

| Dimension | What It Measures |
| --- | --- |
| Tone alignment | Match with voice and tone |
| Messaging alignment | Match with positioning and approved messages |
| Banned phrase safety | Restricted language, risky claims, and off-policy phrasing |
| Audience fit | Fit for reader context and expectations |
| Clarity and trust | Clear, credible, non-misleading communication |

Content types have different dimension weights in `lib/constants.ts`. Findings are categorized by issue type:

- `mild_style`
- `hype_phrase`
- `banned_phrase`
- `absolute_claim`
- `direct_contradiction`

## Architecture

```txt
Next.js App Router UI
  |
  | Convex React + Convex Auth
  v
Convex queries, mutations, actions, scheduled functions
  |
  | database + auth tables + RAG component
  v
Convex DB
  |
  | brand namespace retrieval
  v
@convex-dev/rag
  |
  | Google embeddings + Gemini generation through AI SDK
  v
Structured audit report + deterministic score + saved findings
```

Frontend responsibilities:

- Route rendering.
- App shell and sidebar.
- Workspace selection.
- UI permission visibility.
- Forms, tables, charts, report views, and print views.
- Calling generated Convex APIs.

Backend responsibilities:

- Authentication and authorization.
- Workspace, member, invite, notification, brand, draft, report, and finding persistence.
- Brand Constitution versioning.
- RAG ingestion and retrieval.
- Audit processing.
- Deterministic scoring.
- Maintenance utilities.

## Data Model

Primary Convex tables:

| Table | Purpose |
| --- | --- |
| `workspaces` | Workspace records |
| `workspaceMembers` | User membership, role, and membership status |
| `workspaceInvites` | Invite email, role, token hash, status, expiry |
| `brands` | Brand profile, constitution, RAG status, workspace ownership |
| `brandConstitutionVersions` | Versioned constitution snapshots |
| `auditDrafts` | Saved drafts before audit execution |
| `auditReports` | Report metadata, scores, verdict, rewrite, status |
| `auditFindings` | Sentence-level findings, reason, evidence, severity, issue type |
| `notifications` | User-facing notification feed |
| auth tables | Convex Auth user, account, session, token, rate-limit state |

RAG data is stored in component-owned tables managed by `@convex-dev/rag`.

## Project Structure

```txt
app/                     Next.js route entries
components/audit/        Audit form, drafts, results, rewrite comparison
components/analytics/    Analytics charts, filter bar, risky audit table
components/brands/       Brand setup, edit, selector, version history, RAG status
components/dashboard/    Dashboard summary cards and workspace widgets
components/docs/         Public docs content and UI
components/history/      Report history table and columns
components/layout/       Authenticated app shell and sidebar
components/landing/      Marketing landing page
components/notifications Notification bell and feed
components/providers/    Convex and workspace providers
components/reports/      Report detail, print, delete, download, retry
components/scoring/      Public scoring guide
components/shared/       Shared product UI
components/team/         Team management and invite acceptance
components/ui/           shadcn/ui primitives
convex/                  Convex schema, auth, queries, mutations, actions
docs/                    Product, architecture, scoring, and task notes
hooks/                   Reusable React hooks
lib/                     Types, constants, scoring helpers, routes, permissions
public/                  Static assets
```

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Radix UI primitives
- lucide-react
- TanStack React Table
- Recharts
- Sonner
- react-to-print
- Convex
- Convex Auth
- `@convex-dev/rag`
- AI SDK
- Google Gemini
- Bun
- ESLint 9

## Prerequisites

- Bun
- Node.js compatible with Next.js 16 and Convex
- A Convex account and deployment
- Google OAuth credentials
- Google Generative AI API key

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Local app variables:

| Variable | Purpose |
| --- | --- |
| `CONVEX_DEPLOYMENT` | Convex deployment name used by Convex CLI |
| `NEXT_PUBLIC_CONVEX_URL` | Public Convex deployment URL for the browser client |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Public Convex HTTP/site URL when needed client-side |
| `SITE_URL` | Next.js site URL, usually `http://localhost:3000` locally |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini embeddings and audit generation |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `DOCS_PUBLIC_VISIBILITY` | `on`, `off`, or `schedule` for `/docs` |
| `DOCS_PUBLIC_START_AT` | Scheduled docs start timestamp |
| `DOCS_PUBLIC_END_AT` | Scheduled docs end timestamp |
| `DOCS_PUBLIC_DURATION_HOURS` | Optional duration override from start timestamp |
| `DOCS_TEAM_JSON` | JSON metadata for the public docs team section |
| `ENABLE_WIPE_ALL_DATA` | Enables dangerous maintenance actions when `true` |
| `WIPE_ALL_DATA_TOKEN` | Required token for maintenance actions |

Convex Auth also requires Convex environment variables:

| Variable | Purpose |
| --- | --- |
| `JWT_PRIVATE_KEY` | Private signing key generated for Convex Auth |
| `JWKS` | Public JWKS generated for Convex Auth |
| `AUTH_GOOGLE_ID` | Google OAuth client ID in Convex runtime |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret in Convex runtime |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key in Convex runtime |

Use Convex CLI commands to set and inspect Convex runtime env vars:

```bash
bunx convex env set KEY value
bunx convex env list
```

## Getting Started

Install dependencies:

```bash
bun install
```

Start Convex in watch mode:

```bash
bun run convex:watch
```

In another terminal, start Next.js:

```bash
bun run dev
```

Open:

```txt
http://localhost:3000
```

For a one-shot Convex sync/codegen before build:

```bash
bun run convex
```

## Google OAuth Setup

Create a Google OAuth client and configure redirect URLs for Convex Auth. For local development, the callback URL is based on the Convex site URL and the Convex Auth route.

Make sure these values are available in the correct places:

- `AUTH_GOOGLE_ID` in `.env.local` and Convex env.
- `AUTH_GOOGLE_SECRET` in `.env.local` and Convex env.
- `SITE_URL` for the Next.js app URL.
- Convex Auth JWT env vars generated by `bunx @convex-dev/auth`.

## Scripts

| Command | Purpose |
| --- | --- |
| `bun install` | Install dependencies from `bun.lock` |
| `bun run dev` | Start the Next.js dev server |
| `bun run build` | Create a production Next.js build |
| `bun run start` | Serve the production build |
| `bun run prod` | Run Convex once, build, then start |
| `bun run lint` | Run ESLint |
| `bun run sad <component>` | Add shadcn/ui components |
| `bun run convex` | Run `convex dev --once` |
| `bun run convex:watch` | Run Convex dev continuously |
| `bun run convex:deploy` | Deploy Convex functions |
| `bun run convex:dash` | Open Convex dashboard |

## Development Workflow

Typical local workflow:

1. Run `bun install`.
2. Configure `.env.local`.
3. Configure Convex env vars.
4. Run `bun run convex:watch`.
5. Run `bun run dev`.
6. Sign in with Google.
7. Create or select a workspace.
8. Create a brand and wait for RAG status to become ready.
9. Run an audit.
10. Validate the report, history, dashboard, and analytics surfaces.

## Validation

No automated test framework is currently configured. Validate changes with:

```bash
bun run lint
bun run build
```

For UI behavior, also run:

```bash
bun run dev
```

Then smoke test key flows:

- Google sign-in and sign-out.
- Workspace creation and switching.
- Brand creation/editing and RAG status.
- Draft save/edit/discard/run.
- Manual audit creation.
- Processing, completed, failed, and retry report states.
- Report download/print.
- History search/filter/load-more.
- Team invites, acceptance, decline, revocation, role changes, and removals.
- Notifications.
- Analytics filters and charts.
- Public `/scoring` and `/docs`.

## Deployment

Deploy Convex functions:

```bash
bun run convex:deploy
```

Build the Next.js app:

```bash
bun run build
```

The app is suitable for deployment on Vercel or another Next.js-compatible host. The production deployment needs matching Convex, Google OAuth, Gemini, and docs/maintenance environment variables.

## Security Notes

- Do not commit `.env.local`, production secrets, Convex auth keys, OAuth secrets, or API keys.
- Backend authorization is enforced in Convex functions.
- Maintenance wipe actions require explicit env gating and a token.
- Invite tokens are stored as hashes.
- Workspace-scoped resources are checked server-side.
- RAG namespaces are brand-specific.

## Current Limitations

- Brand deletion is not implemented.
- Workspace deletion is not implemented.
- Owner transfer is not implemented.
- Invite links are generated for manual sharing; automated email delivery is not implemented.
- No automated test framework is configured yet.
- No billing/plans are implemented.
- No public report sharing is implemented.
- No CMS, social, document, Slack, or publishing integrations are implemented in the current product.

## Roadmap Ideas

- Automated test coverage.
- Richer failed-audit recovery.
- Email invite delivery.
- Owner transfer.
- Report comparison.
- Configurable scoring policies per workspace or brand.
- Batch audits.
- Public/shared reports.
- CMS, social, document, and publishing integrations.
- Billing and plan limits.
