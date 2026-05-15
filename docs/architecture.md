# NarrativeGuard Convex Architecture Plan

## Summary

NarrativeGuard is a Next.js and Convex application where Convex owns the backend, database, vector search, background jobs, scheduler, file storage, and AI execution through Convex Agent.

The frontend starts audits and renders live state. Convex handles scraping, RAG, AI judging, report creation, Slack alerts, scheduling, and persistence.

```txt
Next.js UI
  |
  | convex/react
  v
Convex Functions
  |
  | queries / mutations / actions / crons
  v
Convex DB + Storage + Vector Indexes
  |
  v
Convex Agent
  |
  | tools + RAG + AI judgment + report synthesis
  v
External Services
  - OpenAI or Anthropic model provider
  - Apify for social scraping
  - Slack webhook
  - Public websites and RSS feeds
```

## Main Components

### 1. Frontend App

The frontend is a Next.js application using Tailwind and `convex/react`.

Primary pages:

| Page | Purpose |
|---|---|
| `/setup` | Create brands and ingest Brand Constitution content |
| `/audit` | Start audits and view live job status |
| `/history` | Review previous reports |

The UI uses Convex queries for realtime state. It does not need a separate polling API.

### 2. Convex Backend

Convex replaces a traditional API server.

Convex function responsibilities:

| Function type | Responsibility |
|---|---|
| Queries | Read brands, jobs, reports, content pieces, and result details |
| Mutations | Create brands, targets, audit jobs, content rows, result rows, and report rows |
| Actions | Run side effects: scraping, parsing, embeddings, vector search, AI calls, and Slack calls |
| Scheduler | Run background audit jobs after user-triggered mutations |
| Crons | Run recurring brand audits |

### 3. Convex Database

Convex is the system of record.

Core tables:

| Table | Purpose |
|---|---|
| `brands` | Brand profile and parsed constitution metadata |
| `constitutionChunks` | Chunked Brand Constitution text and embeddings |
| `monitoringTargets` | Website, RSS, social, and press-release sources |
| `auditJobs` | Audit lifecycle and status |
| `contentPieces` | Scraped or fetched content items |
| `coherenceResults` | Per-content scoring results |
| `brandReports` | Final audit report summaries |

### 4. Convex Storage

Convex storage holds uploaded Brand Constitution files.

Recommended ingestion flow:

```txt
User uploads brand guidelines
  |
  v
File stored in Convex storage
  |
  v
Convex action parses file
  |
  v
Text is chunked
  |
  v
Embeddings are created
  |
  v
Chunks and vectors are stored in Convex
```

### 5. Convex Vector Search

The `constitutionChunks` table has a vector index on `embedding`.

For each content piece:

```txt
Content text
  |
  v
Embedding generated
  |
  v
Convex vector search
  |
  v
Top matching Brand Constitution clauses filtered by brand
  |
  v
Clauses passed into Convex Agent judgment
```

This keeps RAG inside Convex and avoids a separate vector database.

### 6. Convex Agent Component

All AI tasks run through Convex Agent.

Agents:

| Agent | Responsibility |
|---|---|
| `narrativeGuardAgent` | Orchestrates audit workflow |
| `brandJudgeAgent` | Scores one content piece against retrieved clauses |
| `reportAgent` | Synthesizes final executive summaries |

Agent tools:

| Tool | Purpose |
|---|---|
| `scrapeWebsite` | Fetch and extract website copy |
| `fetchRssFeed` | Parse RSS or Atom feed entries |
| `fetchFacebookPosts` | Pull social posts through Apify |
| `retrieveBrandClauses` | Run RAG over Convex vector index |
| `judgeContent` | Score content and generate rewrite |
| `sendSlackAlert` | Notify channel when score is below threshold |
| `finalizeReport` | Store final report summary |

Agent threads should be stored on `auditJobs.agentThreadId` so each audit can preserve trace history.

### 7. Scraping Layer

Scraping runs in Convex actions or Agent tools.

Supported sources:

| Source | Method |
|---|---|
| Website | `fetch` plus HTML parsing |
| RSS | Feed XML parsing |
| Facebook or Instagram | Apify actors |
| Press releases | Website scrape or RSS |
| Uploaded documents | Convex storage plus parser action |

Scraped content is stored as `contentPieces` before scoring.

### 8. Slack Alerts

Slack alerts are sent from Convex actions when a content score falls below `alertThreshold`.

Alert payload should include:

- Brand name
- Source URL
- Score
- Verdict
- Flagged sentence count
- Short reason summary
- Link back to the report page

Slack webhooks should be stored as Convex environment variables or encrypted brand settings. They should not be passed repeatedly through the frontend after initial setup.

## Audit Workflow

```txt
User clicks Start Audit
  |
  v
startAudit mutation
  - creates auditJobs row with status "queued"
  - schedules runAudit action
  |
  v
runAudit action
  - loads brand and monitoring targets
  - creates Convex Agent thread
  - marks job "scraping"
  |
  v
Agent scrapes targets
  - stores contentPieces
  |
  v
For each content piece
  - embed text
  - retrieve Brand Constitution chunks with Convex vector search
  - judge with brandJudgeAgent
  - store coherenceResults
  - send Slack alert if below threshold
  |
  v
reportAgent summarizes all results
  - stores brandReports row
  - marks job "complete"
  |
  v
Frontend updates live through Convex queries
```

## Recommended File Layout

```txt
app/
  setup/page.tsx
  audit/page.tsx
  history/page.tsx

components/
  ScoreRing.tsx
  CoherenceCard.tsx
  FlaggedSentence.tsx

convex/
  convex.config.ts
  schema.ts
  agents.ts
  tools.ts
  brands.ts
  rag.ts
  audits.ts
  judge.ts
  reports.ts
  crons.ts
```

## Operational Notes

- Use mutations only for durable writes.
- Use actions for side effects: scraping, embeddings, model calls, Slack, file parsing, and vector search.
- Use Convex queries for live UI state.
- Use scheduled functions for background audit execution.
- Use cron jobs for recurring audits.
- Store retrieved clause snapshots on each result so historical reports remain explainable even if the Brand Constitution changes later.

