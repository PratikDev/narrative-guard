# Narrative Guard PRD

## 1. Product Overview

Narrative Guard is a workspace-based brand audit platform for teams that need to check whether written content follows a brand constitution, voice, tone, claim policy, messaging rules, and content-type expectations.

Users create workspaces, invite teammates, create brands inside a workspace, add a detailed Brand Constitution, and audit content against that constitution. The platform retrieves relevant constitution context through RAG, asks an AI model for structured audit dimensions and findings, and then calculates the final score and verdict with deterministic backend scoring logic.

The current product is functional for P1 usage:

1. Users sign in with Google.
2. Users work inside a selected workspace.
3. Owners/admins create and edit brands.
4. Members can read brand constitutions and run audits.
5. Brand constitutions are indexed into RAG.
6. Users submit content by content type.
7. The backend generates an audit report.
8. Reports include score, verdict, summary, rewrite, findings, issue types, evidence, and score breakdown.
9. Users can search/filter history, re-audit from a report, download a PDF, and manage team access.

## 2. Goals

### 2.1 Current Goals

- Provide a usable workspace-based app for teams.
- Let teams define brands with detailed Brand Constitutions.
- Index each Brand Constitution for brand-specific RAG.
- Audit content against selected brand guidance.
- Support multiple content types with different scoring behavior.
- Generate structured, saved audit reports.
- Explain scoring clearly to non-technical users.
- Let users download report PDFs.
- Let teammates collaborate under workspace roles.
- Protect data with Google login and server-side authorization.

### 2.2 Near-Term Goals

- Improve manual QA coverage and add automated tests.
- Add better report/finding analytics.
- Add richer failed audit recovery.
- Improve invite operations, such as email delivery.
- Add optional owner transfer if workspace ownership needs to move.

### 2.3 Long-Term Goals

- Advanced workspace analytics.
- User-wide finding analytics.
- Brand-level score trends over time.
- Batch audits.
- Public/shared reports.
- CMS/social/document integrations.
- Configurable scoring policies per workspace or brand.
- Billing/plans if this becomes a SaaS product.

## 3. Target Users

### 3.1 Primary Users

- Marketing teams
- Brand managers
- Content writers
- Editors
- Founders and operators reviewing published content

### 3.2 Secondary Users

- QA teams
- Internal reviewers
- Agencies managing multiple brands or client workspaces
- Brand consultants

## 4. Tech Stack

### 4.1 Frontend

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI primitives
- lucide-react icons
- TanStack React Table
- react-to-print for PDF/print export
- Convex React client
- Convex Auth Next.js integration

### 4.2 Backend

- Convex
- Convex database
- Convex queries, mutations, actions, and internal functions
- Convex generated schema types
- Convex Auth
- `@convex-dev/rag`

### 4.3 AI / RAG

- Google Gemini
- `gemini-embedding-001` for embeddings
- `gemini-2.5-flash` for audit generation
- AI SDK `generateText`
- AI SDK structured output with Zod schema validation
- `@convex-dev/rag` for Brand Constitution indexing and retrieval

### 4.4 Tooling

- Bun
- ESLint
- TypeScript strict mode
- Convex codegen
- shadcn CLI helper script

## 5. Application Routes

### 5.1 Public Routes

- `/`: landing page.
- `/signin`: Google sign-in page.
- `/scoring`: public scoring guide for non-technical users.

### 5.2 Authenticated App Routes

- `/dashboard`: workspace dashboard with stats, recent reports, and brand health.
- `/setup`: brand list, brand creation for owner/admin, constitution reading for members.
- `/setup/[brandId]`: brand edit for owner/admin, read-only constitution view for members.
- `/audit`: manual content audit form.
- `/history`: searchable/filterable audit history.
- `/reports/[reportId]`: report detail page.
- `/team`: workspace members, invites, roles, role guide, and workspace settings.
- `/invite/[token]`: invite acceptance page.

### 5.3 App Shell

Authenticated routes use the app shell:

- Sidebar navigation.
- Workspace switcher.
- Create workspace dialog.
- Signed-in user footer.
- Sign out action.

## 6. Current Feature Set

### 6.1 Landing Page

The root route is a product landing page. It includes:

- Header with auth-aware navigation.
- Hero section.
- Dashboard preview image.
- History/report preview image.
- Workflow section.
- Supported audit types.
- Report output explanation.
- Scoring transparency link.
- Use cases.
- Final call to action.

### 6.2 Authentication

Authentication uses `@convex-dev/auth` with Google OAuth.

Current behavior:

- Public pages are accessible without login.
- Protected app pages require authentication.
- Signed-in users are redirected away from `/signin`.
- Google auth state is used by Convex functions.
- Backend authorization derives identity server-side.
- Client-provided user IDs are not trusted for authorization.

### 6.3 Workspaces

Workspaces are the top-level collaboration boundary.

Current behavior:

- A default workspace is created for a user when needed.
- Users can create additional workspaces from the sidebar workspace switcher.
- Users can switch active workspace from the sidebar.
- Selected workspace is stored in localStorage.
- Dashboard, brands, audit form, report history, report details, and team page are scoped to the selected workspace.
- Workspace data access is verified server-side.
- Owners can rename a workspace from `/team`.
- Workspace delete is intentionally not implemented.

### 6.4 Team Management

The Team page supports workspace collaboration.

Current behavior:

- Users can view workspace members.
- Users can see their current role.
- Users can read a role guide.
- Owners can invite admins and members.
- Admins can invite members.
- Invite links are generated and copied manually.
- Invited users accept links at `/invite/[token]`.
- Owners can change admin/member roles.
- Owners can remove admins or members.
- Admins can remove members.
- Users cannot remove themselves.
- Admins cannot invite admins.
- Admins cannot manage owners or admins.
- Pending invites can be revoked.
- Duplicate pending invites are blocked.
- Existing active members cannot be invited again.
- Revoked, expired, wrong-email, and already-member invite errors are shown through shadcn alert UI.

### 6.5 Role Model

There are exactly three roles.

#### Owner

Owner can:

- Rename workspace.
- Invite admins.
- Invite members.
- Change admin/member roles.
- Remove admins.
- Remove members.
- Create brands.
- Edit brands.
- Read brand constitutions.
- Run audits.
- View dashboard/history/reports.
- Delete reports.
- Download reports.

Owner cannot currently:

- Delete workspace.
- Transfer ownership through a dedicated flow.

#### Admin

Admin can:

- Invite members.
- Remove members.
- Create brands.
- Edit brands.
- Read brand constitutions.
- Run audits.
- View dashboard/history/reports.
- Delete reports.
- Download reports.

Admin cannot:

- Rename workspace.
- Invite admins.
- Change roles.
- Remove owners.
- Remove admins.
- Delete workspace.

#### Member

Member can:

- Read brand constitutions.
- Run audits.
- View dashboard/history/reports.
- Download reports.
- View team members and role guide.

Member cannot:

- Create brands.
- Edit brands.
- Delete reports.
- Invite users.
- Remove users.
- Rename workspace.
- Change roles.

### 6.6 Brand Management

Brands belong to workspaces.

Current behavior:

- Owners/admins can create brands.
- Owners/admins can edit brands.
- Members can read Brand Constitutions.
- Brand records include name, constitution, creator user ID, workspace ID, timestamps, and RAG status.
- Brand constitutions are indexed after create/update.
- RAG status is shown in the UI.
- RAG errors are shown when indexing fails.
- Existing brands are listed on setup and dashboard-related views.
- Brand edit actions are hidden from members.
- Brand deletion is not implemented.
- Slugs are not used.

### 6.7 RAG Indexing

RAG is powered by `@convex-dev/rag`.

Current behavior:

- Each brand has a brand-specific RAG namespace.
- The Brand Constitution is indexed with a stable key.
- Updating a Brand Constitution replaces the previous RAG entry.
- RAG metadata includes brand ID and source type.
- Audits search the brand namespace with hybrid search.
- Audit generation receives retrieved context.
- RAG tables are treated as component-owned implementation details.

### 6.8 Audit

Users run manual audits from `/audit`.

Current behavior:

- User selects a ready brand.
- User selects a content type.
- User pastes content.
- Backend creates a processing report.
- Backend schedules audit generation.
- Backend retrieves brand RAG context.
- AI returns structured dimensions, summary, rewrite, and findings.
- Backend calculates final score and verdict.
- Backend saves report and findings.
- User is routed to report detail.
- Failed audits store failed status and error.

Supported content types:

- Generic text
- Social post
- Website copy
- Email
- Press release
- Ad copy

### 6.9 Re-Audit

Users can re-audit from a completed report.

Current behavior:

- Completed report detail shows a Re-audit button.
- Re-audit opens `/audit?sourceReportId=...`.
- Audit form loads source report.
- Brand is prefilled.
- Content type is prefilled.
- Rewritten content is prefilled as the new audit content.
- User can submit a new audit.

### 6.10 Reports

Reports are saved audit outputs.

Current report detail includes:

- Back action.
- Download PDF action.
- Re-audit action for completed reports.
- Delete report action for owner/admin.
- Processing alert for processing reports.
- Failure alert for failed reports.
- Brand name.
- Content type.
- Created date.
- Final score.
- Verdict.
- Summary.
- Original/rewrite comparison with diff-style visual highlighting.
- Copy rewritten content button.
- Findings accordion.
- Score breakdown accordion.

Report delete behavior:

- Only owner/admin can delete reports.
- Deleting a report deletes associated findings.
- Deleting a report does not delete the brand or constitution.

### 6.11 PDF Download

Completed reports can be downloaded/printed through the browser PDF flow.

Current PDF content includes:

- Report details.
- Score and verdict.
- Summary.
- Original and rewritten content side by side.
- Findings expanded.
- Score breakdown expanded.

The PDF intentionally excludes the interactive diff view and uses a print-friendly layout.

### 6.12 History

History is implemented with TanStack React Table.

Current behavior:

- Reports are paginated from Convex.
- History supports search by brand/content/summary.
- History supports verdict filtering.
- History supports content type filtering.
- Infinite load-more behavior triggers near the bottom.
- Actions include open report, download completed report, and delete report for owner/admin.

### 6.13 Dashboard

Dashboard is workspace-scoped.

Current dashboard includes:

- Total reports.
- Average score.
- Verdict counts.
- Recent reports.
- Brand health summary.
- Latest report links.
- Create brand action for owner/admin.
- Run audit action.

### 6.14 Scoring Guide

The public scoring guide explains how audit scoring works.

Current sections include:

- Simple final-score formula.
- Verdict thresholds.
- Content-type policy tabs.
- Issue type reference.
- Base penalty table.
- Worked scoring example.
- Score floors and caps explanation.

### 6.15 Maintenance Utilities

Maintenance utilities are development/admin-only.

Current maintenance functions:

- Wipe all app data.
- Wipe auth data.
- Wipe workspace data.
- Wipe RAG namespaces.
- Seed issue types for older findings if needed.

Maintenance is disabled unless explicit Convex environment variables are set.

## 7. Architecture

### 7.1 Frontend Architecture

The app uses Next.js App Router.

Main folders:

- `app/`: route entries.
- `components/audit`: audit form and report subviews.
- `components/brands`: brand setup, edit, selectors, RAG status.
- `components/dashboard`: dashboard stats, recent reports, brand health.
- `components/history`: report history table and filters.
- `components/landing`: public landing page.
- `components/layout`: authenticated app shell and sidebar.
- `components/providers`: Convex and workspace providers.
- `components/reports`: report detail, delete, download, printable report.
- `components/scoring`: scoring guide UI.
- `components/shared`: shared product UI.
- `components/team`: team and invite acceptance UI.
- `components/ui`: shadcn/ui primitives.
- `hooks`: reusable frontend hooks.
- `lib`: constants, types, scoring guide config, permissions, route helpers.

Workspace selection is managed client-side by `WorkspaceProvider`.

### 7.2 Backend Architecture

Convex owns:

- Auth data.
- Workspace data.
- Team membership/invites.
- Brand data.
- Audit report data.
- Audit finding data.
- RAG integration.
- AI audit orchestration.
- Maintenance utilities.

Public Convex functions are used for frontend-facing operations. Internal Convex functions/actions are used for background audit processing and brand constitution indexing.

### 7.3 Authorization Architecture

Authorization rules live on the backend and are mirrored in the frontend only for UI visibility.

Backend helpers:

- `requireAuthUserId`
- `requireWorkspaceMember`
- `requireWorkspaceRole`
- `resolveWorkspaceForQuery`
- `resolveWorkspaceForMutation`
- `canManageWorkspaceMember`

Frontend helper:

- `lib/workspace-permissions.ts`

Frontend permission checks hide unavailable actions, but backend checks remain the source of truth.

### 7.4 AI/RAG Architecture

Audit generation flow:

1. User submits audit.
2. Convex creates a processing report.
3. Convex schedules internal audit processing.
4. Internal action loads report and brand.
5. RAG searches the brand namespace.
6. Prompt builder combines brand, content type policy, submitted content, and RAG context.
7. Gemini returns structured output.
8. Backend calculates final score.
9. Backend saves report and findings.

### 7.5 Scoring Architecture

Scoring is intentionally separated from audit business logic.

Config lives in:

- `convex/lib/auditScoring.ts`
- `convex/lib/auditContentTypes.ts`
- `convex/lib/auditPrompts.ts`
- `lib/audit-scoring-guide.ts`

Final score formula:

```text
Final Score = Weighted dimension score - issue penalties
```

Then the backend applies:

- Content-type-specific penalty multipliers.
- Score caps for severe or risky cases.
- Score floors for isolated non-severe issues.
- Rounding and clamp to 0-100.

The AI does not decide the final score alone.

## 8. Data Model

### 8.1 Auth Tables

Auth tables are managed by `@convex-dev/auth`.

They include users, sessions, accounts, verification codes, refresh tokens, and rate limits.

### 8.2 Workspaces

Fields:

- `name`
- `createdByUserId`
- `createdAt`
- `updatedAt`

Indexes:

- `by_created_by_user`

### 8.3 Workspace Members

Fields:

- `workspaceId`
- `userId`
- `role`: `owner`, `admin`, `member`
- `status`: `active`, `removed`
- `createdAt`
- `updatedAt`

Indexes:

- `by_workspace`
- `by_user`
- `by_workspace_and_user`

### 8.4 Workspace Invites

Fields:

- `workspaceId`
- `email`
- `role`: `admin`, `member`
- `tokenHash`
- `status`: `pending`, `accepted`, `revoked`, `expired`
- `invitedByUserId`
- `expiresAt`
- `createdAt`
- `updatedAt`

Indexes:

- `by_token_hash`
- `by_workspace`
- `by_email`

Security note:

- The raw invite token is returned once to the inviter.
- Only the token hash is stored.

### 8.5 Brands

Fields:

- `userId`
- `workspaceId`
- `name`
- `constitution`
- `ragStatus`
- `ragError`
- `ragEntryId`
- `ragIndexedAt`
- `createdAt`
- `updatedAt`

Indexes:

- `by_user`
- `by_workspace`
- `by_workspace_and_updated`

### 8.6 Audit Reports

Fields:

- `userId`
- `workspaceId`
- `brandId`
- `contentType`
- `originalContent`
- `score`
- `verdict`
- `summary`
- `toneAlignment`
- `messagingAlignment`
- `bannedPhraseSafety`
- `audienceFit`
- `clarityAndTrust`
- `rewriteSuggestion`
- `status`
- `error`
- `createdAt`
- `updatedAt`

Indexes:

- `by_user_created`
- `by_workspace_created`
- `by_brand_created`
- `by_created`
- `by_verdict`
- `by_user_verdict`
- `by_workspace_verdict`
- `by_brand_verdict`

### 8.7 Audit Findings

Fields:

- `userId`
- `workspaceId`
- `reportId`
- `brandId`
- `sentence`
- `reason`
- `evidence`
- `severity`: `low`, `medium`, `high`
- `issueType`
- `createdAt`

Issue types:

- `mild_style`
- `hype_phrase`
- `banned_phrase`
- `absolute_claim`
- `direct_contradiction`

Indexes:

- `by_user`
- `by_workspace`
- `by_report`
- `by_brand`

### 8.8 RAG Tables

RAG tables are owned by `@convex-dev/rag`.

Application code should use the RAG component API instead of depending on internal RAG table structure.

## 9. User Flows

### 9.1 Sign-In Flow

1. User opens a protected page.
2. Middleware redirects to `/signin`.
3. User signs in with Google.
4. Auth state is stored by Convex Auth.
5. User is redirected back to the requested page or dashboard.

### 9.2 Workspace Flow

1. User signs in.
2. If no workspace exists, the app creates a default workspace.
3. User selects a workspace from sidebar.
4. User can create a new workspace from the switcher.
5. Owner can rename workspace from `/team`.
6. All app data is loaded for the selected workspace.

### 9.3 Invite Flow

1. Owner/admin opens `/team`.
2. Owner/admin enters email and role.
3. Convex validates role permissions.
4. Convex blocks duplicate active members and duplicate pending invites.
5. Convex stores invite token hash.
6. UI shows one-time invite URL.
7. Invited user opens `/invite/[token]`.
8. User signs in if needed.
9. Convex validates token, status, expiry, and email.
10. User is added to workspace.
11. Invite status becomes accepted.

### 9.4 Brand Flow

1. Owner/admin opens `/setup`.
2. User creates or edits brand.
3. Convex saves brand in current workspace.
4. RAG indexing starts.
5. UI shows RAG status.
6. Future audits use the latest indexed Brand Constitution.

Member behavior:

1. Member opens `/setup` or `/setup/[brandId]`.
2. Member can read Brand Constitutions.
3. Member cannot edit or create brands.

### 9.5 Audit Flow

1. User opens `/audit`.
2. User selects a ready brand.
3. User selects content type.
4. User enters content.
5. User starts audit.
6. Convex creates report with `processing` status.
7. Internal action processes audit.
8. Report becomes `complete` or `failed`.
9. User reviews report detail.

### 9.6 Re-Audit Flow

1. User opens a completed report.
2. User clicks Re-audit.
3. Audit page loads the source report.
4. Brand/content type are prefilled.
5. Rewrite suggestion is used as the new content.
6. User submits another audit.

### 9.7 Report History Flow

1. User opens `/history`.
2. Reports load by selected workspace.
3. User searches or filters reports.
4. User opens report detail.
5. Owner/admin can delete reports.
6. User can download completed reports.

### 9.8 Maintenance Wipe Flow

1. Operator enables wipe env var.
2. Operator provides secret token.
3. Operator provides confirmation string.
4. Convex deletes app tables.
5. Convex deletes auth tables.
6. Convex deletes RAG namespaces.

## 10. Functional Requirements

### 10.1 Authentication

- Users must sign in with Google for protected app pages.
- Sign-in page must support safe redirect after login.
- Backend functions must derive identity server-side.
- Frontend must not provide user IDs for authorization.

### 10.2 Workspace

- User must always operate inside a workspace.
- User can create workspaces.
- User can switch workspaces.
- Active workspace must persist after refresh.
- Workspace access must be checked server-side.
- Owner can rename workspace.
- Workspace delete is not available.

### 10.3 Team

- Users can view active workspace members.
- Owners/admins can create invite links.
- Owners can invite admins/members.
- Admins can invite members only.
- Owners can change admin/member roles.
- Owners can remove admins/members.
- Admins can remove members only.
- Users cannot remove themselves.
- Invite errors must be visible with alert UI.

### 10.4 Brand Management

- Owner/admin can create brands.
- Owner/admin can edit brands.
- Member can read Brand Constitutions.
- Brand Constitution is required.
- Brand Constitution must be indexed into RAG.
- Updating a Brand Constitution must replace indexed guidance.
- Brand deletion is not available.

### 10.5 Auditing

- User can audit content under current workspace.
- User can only audit brands in an accessible workspace.
- User can audit only ready brands.
- User must select content type.
- Audit must use RAG context from selected brand.
- Audit must save report and findings.
- Audit must handle AI/RAG failures gracefully.

### 10.6 Reports

- User can view workspace reports.
- User can view report detail after refresh.
- User can download completed reports as PDF.
- User can re-audit completed reports.
- Owner/admin can delete reports.
- Deleting a report must delete findings.
- Deleting a report must not delete the brand.

### 10.7 History

- History must be workspace-scoped.
- History must support pagination.
- History must support search.
- History must support verdict filter.
- History must support content type filter.

### 10.8 Scoring

- Scoring guide must explain final score in non-technical language.
- Scoring guide must show content type policies.
- Scoring guide must show weights, penalties, caps, and issue types.
- Backend must calculate final score and verdict.

### 10.9 Maintenance

- Wipe utility must be disabled by default.
- Wipe utility must require env enablement.
- Wipe utility must require token and confirmation.
- Wipe utility must delete app, workspace, auth, and RAG data.

## 11. Non-Functional Requirements

### 11.1 Security

- No secrets in source control.
- OAuth credentials stored in environment variables.
- Google AI key stored in Convex environment.
- Invite tokens stored as hashes only.
- Backend authorization must not trust client role checks.
- Workspace data must not leak across memberships.
- Maintenance wipe must be protected.

### 11.2 Reliability

- Failed audits should show failure state.
- Failed RAG indexing should show error state.
- Report detail should handle processing, complete, and failed states.
- Invite accept/revoke/expired errors should be visible.
- Brand update should replace active RAG guidance.

### 11.3 Performance

- Workspace/report/history queries should use indexes.
- Report history should paginate.
- Findings must remain separate from reports.
- Brand constitutions should use RAG component APIs.
- Avoid unbounded arrays inside documents.

### 11.4 Type Safety

- Use TypeScript.
- Use Convex generated types where possible.
- Keep Convex validators on all functions.
- Avoid `any`.
- Keep schema and frontend types aligned.

### 11.5 Maintainability

- Keep prompt/scoring config separate from audit business logic.
- Keep permission helpers reusable.
- Keep feature UI in domain folders.
- Keep shadcn primitives in `components/ui`.
- Keep files understandable and scoped.

### 11.6 Usability

- Main workflows should be discoverable from sidebar.
- Members should not see actions they cannot use.
- Destructive actions require confirmation.
- Errors should use visible alert UI.
- Loading and empty states should be clear.
- Report output should be understandable without developer explanation.

## 12. Environment Variables

### 12.1 Next.js

- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`

### 12.2 Convex / AI / Auth

- `GOOGLE_GENERATIVE_AI_API_KEY`
- `SITE_URL`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `JWT_PRIVATE_KEY`
- `JWKS`

Convex auth config also reads `CONVEX_SITE_URL`.

### 12.3 Maintenance

- `ENABLE_WIPE_ALL_DATA`
- `WIPE_ALL_DATA_TOKEN`

### 12.4 Notes

- `JWT_PRIVATE_KEY` signs Convex Auth JWTs.
- `JWKS` exposes public keys for JWT verification.
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are required for Google OAuth.
- `GOOGLE_GENERATIVE_AI_API_KEY` is required for embeddings and audit generation.
- Wipe variables should not be enabled in production except during intentional admin reset.

## 13. Current Known Product Behavior

- Strong aligned content should score high.
- Mixed content generally lands in `needs_review`.
- Clearly contradictory or risky content should score low.
- Verdict thresholds are currently:
  - `on_brand`: score >= 85
  - `needs_review`: score >= 65 and < 85
  - `off_brand`: score < 65
- A single non-severe issue can still result in `needs_review` because score floors protect otherwise acceptable content from falling too far.
- Severe issues can cap the maximum score.
- Reports include the auditor name/email when available.
- Invite links are shown once because only token hashes are stored.
- Expired pending invites are hidden from invite lists.
- Workspace deletion and brand deletion are not implemented.

## 14. Out Of Scope For Current Version

- Workspace deletion.
- Brand deletion.
- Owner transfer.
- Email delivery for invites.
- Billing/plans.
- Public report sharing.
- Bulk import.
- Direct CMS/social/document integrations.
- Browser extension.
- Human approval workflow.
- Full retry system for failed audits.
- Advanced analytics dashboard.
- Automated test suite.

## 15. Future Plans

### 15.1 Team Enhancements

- Email invite delivery.
- Owner transfer.
- Workspace deletion with clear cascade policy.
- Member action audit log.
- Expired/revoked invite management UI.

### 15.2 Analytics

- Score trend by brand.
- Score trend by workspace.
- Most common issue types.
- Findings by user.
- Findings by content type.
- On-brand/needs-review/off-brand rate over time.

### 15.3 Audit Improvements

- Retry failed audits.
- Retry failed RAG indexing.
- Compare re-audit versions.
- Store audit iterations.
- Add user feedback on findings.
- Add calibrated regression test set.

### 15.4 Brand Management

- Brand deletion.
- Constitution version history.
- Re-index button.
- Indexed guidance preview.
- Brand-specific scoring configuration.

### 15.5 Integrations

- Social media ingestion.
- CMS ingestion.
- Google Docs/Notion ingestion.
- Slack notifications.
- Webhook/API export.

### 15.6 Testing

- Unit tests for scoring.
- Unit tests for permission helpers.
- Convex integration tests for workspace access.
- E2E tests for owner/admin/member flows.
- Regression fixtures with expected scores.

## 16. Success Metrics

### 16.1 Product Metrics

- Users can create a workspace.
- Users can invite teammates.
- Users can create a brand.
- Users can run an audit.
- Reports are understandable.
- Users can find old reports.
- Users can download reports.

### 16.2 Quality Metrics

- On-brand content usually scores high.
- Mixed content usually lands in `needs_review`.
- Off-brand content usually scores low.
- Findings are specific and actionable.
- Rewrites are usable as a next draft.

### 16.3 Technical Metrics

- `bunx convex codegen` passes.
- `bun run lint` passes.
- `bun run build` passes.
- Unauthorized workspace access is blocked.
- Report deletion removes findings.
- Constitution updates do not leave stale active RAG data.

## 17. Manual QA References

Detailed QA docs live in:

- `docs/testing-checklist.md`
- `docs/team-features.md`

Minimum smoke test:

1. Sign in.
2. Create workspace.
3. Create brand.
4. Wait for RAG ready.
5. Run audit.
6. Open report.
7. Download PDF.
8. Re-audit.
9. Invite member.
10. Confirm member can run audit but cannot edit brand or delete reports.

## 18. Open Product Questions

- Should workspace deletion exist, and what should happen to brands/reports/members?
- Should owner transfer be required before production use?
- Should invite links be recoverable, or should copy-once remain the security model?
- Should brand constitutions become structured sections instead of one markdown field?
- Should scoring be configurable per brand or per workspace?
- Should users be able to mark AI findings as correct/incorrect?
- Should re-audits be linked as versions of a prior report?
- Should reports be shareable outside the workspace?
- Should social/CMS integrations return in P2, or stay out until permissions are easier?

## 19. Recommended Next Phase

The recommended next phase is reliability and analytics.

Priority order:

1. Add automated tests for scoring and permissions.
2. Add workspace/brand/report analytics.
3. Add retry support for failed audit or failed RAG indexing.
4. Add owner transfer or workspace deletion policy if needed.
5. Add email delivery for invites.
6. Add report comparison for re-audits.
