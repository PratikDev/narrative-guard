# Narrative Guard PRD

## 1. Product Overview

Narrative Guard is a brand-audit platform that helps teams check whether written content matches a brand's constitution, voice, tone, claims policy, and messaging rules.

Users create brands, define each brand's constitution, and submit content for audit. The platform uses Convex, RAG, and AI scoring to produce a report with a final score, verdict, summary, findings, and recommendations.

The product is currently in an early but functional phase. The main working loop is:

1. Create or update a brand.
2. Add a detailed brand constitution.
3. Index the constitution for RAG.
4. Submit content for audit.
5. Generate an AI-assisted audit report.
6. Review score, verdict, findings, and recommendations.
7. Access saved reports from dashboard/history.

## 2. Goals

### Current Goals

- Let users define brands with detailed brand constitutions.
- Use brand-specific guidance during audits.
- Generate structured audit reports for submitted content.
- Score content consistently using AI output plus deterministic scoring logic.
- Save audit history per authenticated user.
- Protect user data behind Google login.
- Provide a usable dashboard, setup flow, audit flow, and report detail flow.

### Near-Term Goals

- Improve report usability and finding-level UX.
- Make audit results easier for teams to act on.
- Improve brand constitution visibility and indexing status.
- Add stronger history filtering and search.
- Add re-audit/edit workflows.
- Improve scoring precision through more calibration and test cases.

### Long-Term Goals

- Team/workspace support.
- Multiple users under the same organization.
- Role-based access control.
- Batch audits.
- Source-specific audit modes, such as social, article, ad, email, and landing page.
- Advanced analytics across brands, users, and findings.
- Retry support for failed audits.
- Export/share report flows.
- More configurable scoring and policy controls.

## 3. Target Users

### Primary Users

Marketing teams, founders, content writers, editors, and brand managers who need to check whether content follows a brand's internal rules.

### Secondary Users

QA teams and internal reviewers who need to compare expected brand quality against platform-generated scores.

### Future Users

Agencies, brand consultants, and enterprise teams managing multiple brands or client accounts.

## 4. Current Tech Stack

### Frontend

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- lucide-react icons
- Convex React client
- Convex Auth Next.js integration

### Backend

- Convex
- Convex database
- Convex queries, mutations, actions, and internal functions
- Convex schema-driven types
- Convex Auth
- `@convex-dev/rag`

### Authentication

- `@convex-dev/auth`
- Google OAuth
- Convex Auth tables
- Route protection through Next.js `proxy.ts`

### AI / RAG

- Google Gemini
- `gemini-embedding-001` for embeddings
- `gemini-2.5-flash` for audit generation
- `@convex-dev/rag` for constitution indexing and retrieval
- AI SDK `generateText` with structured output handling

### Tooling

- Bun
- ESLint
- Convex codegen
- TypeScript strict mode

## 5. Current Architecture

### 5.1 Frontend Architecture

The app uses the Next.js App Router.

Main app areas:

- Dashboard
- Brand setup
- Brand edit
- Audit page
- Report detail page
- History/report listing
- Sign-in page

Reusable UI is split into domain folders:

- `components/audit`
- `components/brands`
- `components/dashboard`
- `components/history`
- `components/layout`
- `components/reports`
- `components/shared`
- `components/ui`

shadcn components live under `components/ui`.

Frontend data is fetched from Convex functions using generated API references and schema-derived types where applicable.

### 5.2 Backend Architecture

Convex is the main backend. It owns:

- Persistent app data
- Auth data
- Brand records
- Audit reports
- Audit findings
- RAG indexing
- AI audit orchestration
- Maintenance utilities

Public Convex functions are used for frontend-facing operations.

Internal Convex functions are used for reusable backend-only logic, especially around constitution chunking/indexing and operational helpers.

### 5.3 RAG Architecture

Brand constitutions are indexed into RAG using `@convex-dev/rag`.

Current RAG behavior:

- A brand constitution is converted into deterministic chunks.
- Chunks are indexed under a brand-specific namespace.
- Audit generation retrieves relevant constitution context for the submitted content.
- Retrieved context is provided to the AI audit prompt.
- The AI produces structured audit dimensions and findings.
- The backend calculates final score and verdict deterministically.

RAG is used to make audits brand-specific instead of relying only on the submitted prompt.

### 5.4 Scoring Architecture

Scoring is intentionally split from business logic.

Prompt and scoring configuration are stored separately from the main audit flow:

- Audit prompt configuration lives separately.
- Scoring weights, penalties, caps, and floors live separately.
- Audit business logic calls into those helpers.

Current scoring approach:

- AI scores smaller audit dimensions.
- AI identifies findings with type and severity.
- Backend calculates the final score.
- Backend calculates the final verdict.
- Penalties are applied for issues such as banned phrases, hype phrases, absolute claims, and direct contradictions.
- Score caps and floors are used to keep verdict behavior predictable.

The AI does not directly decide the final score as the only source of truth.

## 6. Current Data Model

### 6.1 Auth Tables

Convex Auth manages authentication-related tables, including users, sessions, accounts, verification codes, refresh tokens, and rate limits.

These tables are owned by `@convex-dev/auth`.

### 6.2 Brands

A brand represents one company, product, or identity that content can be audited against.

Current brand fields include:

- Brand name
- Brand description/info
- Brand constitution
- Owner user ID
- Timestamps/status fields as required by implementation

Important behavior:

- Brands are scoped to the authenticated user.
- Brands do not use slugs.
- Brand data is used as the parent entity for audit reports.
- Constitution content is indexed for RAG.

### 6.3 Audit Reports

An audit report represents one content audit run.

Current report behavior:

- Belongs to a brand.
- Belongs to a user.
- Stores submitted content.
- Stores final score.
- Stores verdict.
- Stores summary/reasoning.
- Stores created time.
- Loads on report detail page.
- Appears in dashboard/history.

Reports include `userId` even though they functionally belong to a brand. This supports future user-wide analytics and makes authorization/indexing easier.

### 6.4 Audit Findings

Audit findings represent specific issues detected during an audit.

Current finding behavior:

- Belongs to an audit report.
- Belongs to a brand through the report.
- Belongs to a user for future analytics.
- Has severity.
- Has issue type.
- Has message/reasoning.
- Has recommendation.

Findings are stored separately instead of as an unbounded array on the report.

### 6.5 RAG Tables

RAG tables are managed through `@convex-dev/rag`.

The app should treat these as implementation tables owned by the RAG component. App logic should interact with them through the RAG component APIs, not by manually depending on their internal structure.

## 7. Current User Flows

### 7.1 Sign In Flow

1. User opens the app.
2. If not authenticated, user is routed to sign in.
3. User signs in with Google.
4. Auth state is stored through Convex Auth.
5. App routes become available.

### 7.2 Brand Creation Flow

1. User opens brand setup.
2. User enters brand information.
3. User enters brand constitution.
4. User submits the form.
5. Convex creates the brand for the current user.
6. Constitution is indexed for RAG.
7. Brand appears in saved brand lists.

### 7.3 Brand Edit Flow

1. User sees a saved brand in setup/dashboard.
2. User clicks the edit icon.
3. User is routed to the brand edit page.
4. Existing brand info is loaded.
5. User updates brand information or constitution.
6. Convex updates the brand.
7. Constitution chunks/RAG index are replaced.
8. Future audits use the updated brand guidance.

### 7.4 Audit Flow

1. User opens audit page.
2. User selects a brand.
3. User pastes content to audit.
4. User starts audit.
5. Backend fetches brand and user ownership.
6. Backend retrieves relevant RAG context from the brand constitution.
7. AI generates structured audit output.
8. Backend calculates final score and verdict.
9. Report and findings are saved.
10. User is routed to the report detail page.

### 7.5 Report Detail Flow

1. User lands on `/reports/[reportId]`.
2. App loads the report from Convex.
3. App verifies the report belongs to the current user.
4. App displays score, verdict, summary, findings, and related brand info.
5. Refreshing the page reloads the same saved report.

### 7.6 Dashboard / History Flow

1. User opens dashboard or history.
2. App lists saved brands and recent reports.
3. User can inspect previous reports.
4. User can navigate to brand edit from saved brand items.
5. User can navigate to report detail from report items.

### 7.7 Maintenance Wipe Flow

This is an admin/development utility, not a normal user feature.

1. Operator enables wipe mode using Convex env vars.
2. Operator provides confirmation text and secret token.
3. Convex deletes app tables.
4. Convex deletes auth tables.
5. Convex deletes RAG namespaces.
6. Existing data is removed.

This should remain disabled by default.

## 8. Current UI Requirements

### 8.1 Global UI

- App should feel like a practical internal tool.
- Navigation should be predictable and compact.
- Pages should avoid marketing-style layout.
- Empty states should tell the user what to do next.
- Loading states should make backend activity visible.
- Destructive/admin actions should not be exposed casually.

### 8.2 Dashboard

Dashboard should show:

- Existing brands
- Recent audit reports
- Quick access to audit flow
- Edit icon for each listed brand
- Clear empty state if no brands or reports exist

### 8.3 Brand Setup

Brand setup should support:

- Creating a new brand
- Entering core brand information
- Entering constitution/guidelines
- Saving the brand
- Showing validation errors
- Reusing the same form logic for edit mode

### 8.4 Brand Edit

Brand edit should support:

- Loading existing brand data
- Updating brand info
- Updating constitution
- Re-indexing constitution after save
- Returning to relevant previous flow or dashboard

### 8.5 Audit Page

Audit page should support:

- Brand selection
- Content input
- Submit/run audit action
- Disabled state when required inputs are missing
- Loading state while audit runs
- Navigation to report detail after success
- Error state if audit fails

### 8.6 Report Detail Page

Report detail should show:

- Brand name
- Submitted content
- Final score
- Verdict
- Summary
- Findings
- Recommendations
- Created date/time

Findings should become more structured over time with:

- Severity badges
- Issue type labels
- Grouping by category
- Clear recommendation copy

### 8.7 History

History should show:

- Prior reports
- Brand association
- Score
- Verdict
- Created date
- Navigation to report detail

Future history should support:

- Filtering by brand
- Filtering by verdict
- Date filtering
- Search by submitted content

## 9. Functional Requirements

### 9.1 Authentication

- Users must authenticate with Google.
- Unauthenticated users should not access protected app pages.
- Authenticated users should only see their own brands, reports, and findings.
- Backend functions must derive user identity server-side.
- Frontend must not pass user IDs for authorization decisions.

### 9.2 Brand Management

- User can create a brand.
- User can edit a brand.
- User can view saved brands.
- Brand constitution must be stored.
- Brand constitution must be indexed for RAG.
- Updating constitution must update the RAG index.
- Brand records must be scoped by user.

### 9.3 Auditing

- User can select a brand.
- User can submit content for audit.
- Audit must use the selected brand constitution.
- Audit must retrieve relevant RAG context.
- Audit must generate structured findings.
- Audit must calculate final score server-side.
- Audit must calculate verdict server-side.
- Audit report must be saved.
- Audit findings must be saved.
- User must be routed to report detail after success.

### 9.4 Reports

- User can view saved reports.
- User can refresh report detail pages.
- Reports must be linked to brands.
- Reports must be scoped by user.
- Findings must be linked to reports.
- Report detail should be stable even after page refresh.

### 9.5 Maintenance

- App must support a protected wipe utility for development/admin reset.
- Wipe must require explicit enablement through environment variable.
- Wipe must require a secret token.
- Wipe must require confirmation text.
- Wipe must delete app, auth, and RAG data.

## 10. Non-Functional Requirements

### 10.1 Security

- No secrets should be committed.
- OAuth credentials must be configured through environment variables.
- Google API keys must be stored in Convex environment variables or secure runtime config.
- Backend authorization must never trust client-passed user IDs.
- Maintenance wipe must be disabled by default.
- Data must be isolated per user.

### 10.2 Reliability

- Audit generation should handle AI failures gracefully.
- Failed audits should not create broken report pages.
- RAG indexing should be repeatable.
- Brand updates should not leave stale constitution chunks.
- Report pages should continue working after refresh.

### 10.3 Performance

- Lists should use indexed Convex queries.
- Large report histories should eventually use pagination.
- Findings should stay in a separate table to avoid unbounded report documents.
- Constitution chunks should be managed through RAG component APIs.
- Avoid unnecessary frontend client components.

### 10.4 Type Safety

- Use TypeScript throughout.
- Use Convex generated schema types.
- Avoid duplicated frontend-only types where Convex types are available.
- Avoid `any`.
- Keep validators on all Convex functions.
- Keep shared scoring and prompt contracts explicit.

### 10.5 Maintainability

- Keep business logic separate from configurable prompts and scoring rules.
- Avoid duplicate logic.
- Keep files small enough to understand.
- Prefer local helpers only when logic is truly local.
- Shared backend logic should live in reusable helpers/internal functions.
- UI components should be split by feature/domain.

### 10.6 Usability

- Main workflows should be obvious without instructions.
- Saved brands should be editable from every place they are listed.
- Audit reports should explain why a score was given.
- Recommendations should be actionable.
- Loading, empty, and error states should be clear.

## 11. Environment Variables

### 11.1 Required

- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `SITE_URL`
- `JWT_PRIVATE_KEY`
- `JWKS`

### 11.2 Maintenance / Development

- `ENABLE_WIPE_ALL_DATA`
- `WIPE_ALL_DATA_TOKEN`

### 11.3 Notes

- `JWT_PRIVATE_KEY` is used by Convex Auth to sign JWTs.
- `JWKS` is the public key set used to verify issued JWTs.
- Google OAuth credentials are required for login.
- Google Generative AI key is required for embeddings and audit generation.
- Wipe variables should not be enabled in production unless intentionally performing an admin reset.

## 12. AI Audit Requirements

### 12.1 Model Requirements

Current selected models:

- Embeddings: `gemini-embedding-001`
- Audit generation: `gemini-2.5-flash`

### 12.2 Audit Input

Audit generation requires:

- Brand ID
- User identity
- Submitted content
- Retrieved brand constitution context

### 12.3 Audit Output

AI output should include:

- Dimension scores
- Summary
- Findings
- Issue type
- Severity
- Recommendation/reasoning

AI should not be the sole authority for the final score.

### 12.4 Final Score Calculation

Backend scoring should:

- Use AI-provided dimension scores.
- Apply configured dimension weights.
- Apply finding penalties.
- Apply score caps for severe issues.
- Apply score floors where needed for isolated non-severe issues.
- Produce the final score.
- Produce the final verdict.

### 12.5 Verdicts

Allowed verdicts:

- `on_brand`
- `needs_review`
- `off_brand`

General interpretation:

- `on_brand`: content strongly follows the constitution.
- `needs_review`: content is usable but has meaningful issues.
- `off_brand`: content violates important brand rules or contains severe issues.

## 13. Current Known Product Behavior

- A single risky/hype phrase can currently produce a `needs_review` score around the mid-60s.
- Strongly aligned content should score high.
- Clearly contradictory or risky content should score low.
- Reports are saved and reloadable.
- Brand updates update the constitution used for future audits.
- Existing pre-auth data may not appear for authenticated users unless backfilled.
- User data is scoped by authenticated user.

## 14. Future Plans

### 14.1 Audit UX Improvements

Add:

- Better finding display
- Finding severity badges
- Issue type filters
- Grouped recommendations
- Highlighted problematic phrases if supported
- Clear "what to change" section
- Confidence or evidence indicators

### 14.2 Re-Audit Flow

Add ability to:

- Edit submitted content from a report
- Re-run audit against the same brand
- Compare old and new scores
- Track audit iterations

### 14.3 Report History Enhancements

Add:

- Pagination
- Search
- Brand filter
- Verdict filter
- Date range filter
- Sort by score/date
- Export report

### 14.4 Brand Constitution Management

Add:

- Indexing status
- Last indexed timestamp
- Chunk count
- Re-index button
- Preview indexed guidance
- Constitution version history
- Compare previous/current constitution

### 14.5 Team / Workspace Support

Future workspace model should support:

- Organization/workspace table
- Workspace members
- Roles such as owner, admin, editor, viewer
- Brands belonging to workspace
- Reports belonging to workspace
- User-wide and workspace-wide analytics

### 14.6 Analytics

Future analytics can include:

- Average score by brand
- Score trend over time
- Most common issue types
- Most common banned phrases
- Findings by user
- Findings by source type
- On-brand rate
- Needs-review rate
- Off-brand rate

### 14.7 Source-Specific Audits

Add audit modes for:

- Social post
- Blog/article
- Landing page
- Email
- Advertisement
- Product update
- Press release

Each mode can have different scoring sensitivity and formatting expectations.

### 14.8 Retry / Failure Recovery

Future retry support should include:

- Retry failed AI generation
- Retry failed RAG indexing
- Show failed status clearly
- Avoid duplicate reports on retry
- Store failure reason for debugging

### 14.9 Admin Features

Potential admin features:

- View system health
- Wipe development data
- Re-index all brands
- Inspect RAG namespaces
- Manage AI model settings
- Manage scoring config

### 14.10 Testing Improvements

Add:

- Unit tests for scoring config
- Unit tests for verdict calculation
- Integration tests for Convex audit flow
- Manual QA prompts for brand/audit generation
- Regression dataset with expected scores
- Snapshot-style report output checks

## 15. Out of Scope For Current Phase

The following should not be treated as current functionality unless explicitly implemented later:

- Multi-user organizations
- Paid plans/billing
- Public report sharing
- Bulk CSV import
- Direct CMS integrations
- Browser extension
- Slack/Notion/Google Docs integrations
- Human approval workflow
- Full audit retry system
- Advanced analytics dashboard
- Role-based access control

## 16. Success Metrics

### 16.1 Product Metrics

- Users can create a brand successfully.
- Users can audit content successfully.
- Reports are understandable without explanation.
- Users can identify what needs to be changed.
- Saved reports are easy to find again.

### 16.2 Quality Metrics

- On-brand content usually scores high.
- Mixed content usually lands in `needs_review`.
- Clearly off-brand content usually scores low.
- Similar inputs produce reasonably stable scores.
- Findings are specific and actionable.

### 16.3 Technical Metrics

- `bun run lint` passes.
- `bun run build` passes.
- Convex codegen passes.
- No unauthorized data access between users.
- Audit reports do not save incomplete/broken data.
- Constitution updates do not leave stale active RAG data.

## 17. Manual QA Checklist

### 17.1 Brand Flow

- Create a brand.
- Confirm it appears in saved brand lists.
- Edit the brand.
- Confirm updated info appears.
- Update constitution.
- Confirm future audits reflect the new guidance.

### 17.2 Audit Flow

- Audit clearly on-brand content.
- Audit mixed content.
- Audit clearly off-brand content.
- Confirm score and verdict are reasonable.
- Confirm report detail opens after audit.
- Refresh report detail and confirm it still loads.

### 17.3 History Flow

- Confirm new reports appear in dashboard/history.
- Confirm each report links to the correct detail page.
- Confirm reports show the correct brand.

### 17.4 Auth Flow

- Confirm signed-out users cannot access protected pages.
- Confirm one user cannot see another user's brands or reports.

### 17.5 Maintenance Flow

- Confirm wipe does not run when disabled.
- Confirm wipe requires token.
- Confirm wipe requires confirmation text.
- Confirm wipe removes app/auth/RAG data when explicitly enabled.

## 18. Open Product Questions

- Should brand constitutions support multiple sections/forms instead of one large text field?
- Should audit scoring be configurable per brand?
- Should users be able to mark AI findings as correct/incorrect?
- Should score calibration be global or brand-specific?
- Should report history keep every re-audit version?
- Should the app support team workspaces before advanced analytics?
- Should source type be required before audit?
- Should findings include exact text spans from submitted content?

## 19. Recommended Next Phase

The recommended next phase is report and workflow polish.

Priority order:

1. Improve report detail UI.
2. Add finding-level severity/type display.
3. Add better loading/error/empty states for audit generation.
4. Add report history filtering.
5. Add re-audit flow.
6. Add constitution indexing visibility.
7. Add scoring regression tests.

This phase should make the current core audit loop easier to trust before adding larger platform features.
