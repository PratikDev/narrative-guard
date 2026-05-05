# NarrativeGuard — Convex Technical Specification
**AI Brand Voice Coherence Agent**
*BuildFest Edition · 7-day build · Convex Backend + Convex DB + Convex Agent + RAG · No model training*

---

## 1. What It Does (One Paragraph)

NarrativeGuard is an agentic system that watches everything a brand publishes — social posts, website copy, press releases, ad creatives — and checks each piece against a "Brand Constitution" stored in Convex. It uses Convex actions and Convex Agent tools to scrape live content, Convex vector search for RAG over the Brand Constitution, and Convex Agent-powered LLM judgment to score coherence, flag drift, and generate compliant rewrites. The output is a real-time Brand Coherence Report delivered through a Next.js web UI backed by reactive Convex queries, with optional Slack alerts for off-brand content.

---

## 2. Architecture Overview

```txt
┌─────────────────────────────────────────────────────────┐
│                     USER INTERFACE                       │
│              Next.js + Tailwind + convex/react           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ useQuery / useMutation / useAction
                      │
┌─────────────────────▼───────────────────────────────────┐
│                      CONVEX APP                          │
│                                                          │
│  Mutations                                               │
│  - create brands, targets, jobs, reports                 │
│  - store content pieces and coherence results            │
│                                                          │
│  Queries                                                 │
│  - live audit status                                     │
│  - report dashboard                                      │
│  - history                                               │
│                                                          │
│  Actions                                                 │
│  - scrape content                                        │
│  - parse uploaded docs                                   │
│  - create embeddings                                     │
│  - run vector search                                     │
│  - call Convex Agent                                     │
│  - send Slack alerts                                     │
│                                                          │
│  Crons / Scheduled Functions                             │
│  - recurring brand audits                                │
└──────┬──────────────┬──────────────────┬────────────────┘
       │              │                  │
┌──────▼──────┐ ┌─────▼──────┐ ┌────────▼────────┐
│   SCRAPING  │ │    RAG     │ │  CONVEX AGENT   │
│    TOOLS    │ │   LAYER    │ │   JUDGE FLOW    │
│             │ │            │ │                 │
│ - Web fetch │ │ Embed +    │ │ Score 0-100     │
│ - Apify     │ │ retrieve   │ │ Flag sentences  │
│ - RSS feeds │ │ from       │ │ Explain why     │
│ - Doc parse │ │ Convex     │ │ Rewrite it      │
└─────────────┘ └────────────┘ └─────────────────┘
                      ▲
              ┌───────┴────────┐
              │   CONVEX DB    │
              │                │
              │ Brand docs     │
              │ content pieces │
              │ reports        │
              │ vector chunks  │
              └────────────────┘
```

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Backend** | Convex | Typed server functions, database, storage, scheduling, and realtime sync in one system |
| **Database** | Convex document database | No separate DB or ORM; reactive queries keep the UI live |
| **AI orchestration** | Convex Agent component (`@convex-dev/agent`) | Persistent threads, messages, tools, structured outputs, and agent workflows inside Convex |
| **LLM provider** | AI SDK model provider, e.g. `@ai-sdk/openai` or `@ai-sdk/anthropic` | Convex Agent works with AI SDK language models |
| **Embeddings** | `text-embedding-3-small` or equivalent AI SDK embedding model | Fast, cheap, strong enough for brand constitution RAG |
| **Vector store** | Convex vector indexes | Stores and searches constitution chunks directly in Convex |
| **Web scraping** | Convex actions + `fetch` + Cheerio; Apify for social sources | Actions are the right Convex place for network side effects |
| **Document parsing** | Convex actions + file storage + PDF/DOCX parser service or library | Uploaded docs are stored in Convex and parsed asynchronously |
| **Frontend** | Next.js + Tailwind + `convex/react` | Live audit state without polling infrastructure |
| **Task queue** | Convex scheduler / scheduled functions | Durable background work after mutations |
| **Recurring audits** | Convex cron jobs | Replaces `node-cron` |
| **Notifications** | Slack Webhook API from Convex actions | One outbound `fetch()` call |

---

## 4. Core Data Models

```ts
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  brands: defineTable({
    name: v.string(),
    slug: v.string(),
    constitutionFileId: v.optional(v.id("_storage")),
    rawConstitutionText: v.optional(v.string()),
    toneDescriptors: v.array(v.string()),
    messagingPillars: v.array(v.string()),
    bannedPhrases: v.array(v.string()),
    approvedExamples: v.array(v.string()),
    visualVoiceNotes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),

  constitutionChunks: defineTable({
    brandId: v.id("brands"),
    chunkIndex: v.number(),
    text: v.string(),
    embedding: v.array(v.float64()),
    createdAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["brandId"],
    }),

  monitoringTargets: defineTable({
    brandId: v.id("brands"),
    type: v.union(
      v.literal("facebook"),
      v.literal("instagram"),
      v.literal("website"),
      v.literal("press_release"),
      v.literal("twitter"),
      v.literal("rss"),
    ),
    url: v.string(),
    selector: v.optional(v.string()),
    enabled: v.boolean(),
    createdAt: v.number(),
  }).index("by_brand", ["brandId"]),

  auditJobs: defineTable({
    brandId: v.id("brands"),
    status: v.union(
      v.literal("queued"),
      v.literal("scraping"),
      v.literal("judging"),
      v.literal("reporting"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    agentThreadId: v.optional(v.string()),
    alertThreshold: v.number(),
    slackWebhook: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_brand_created", ["brandId", "createdAt"]),

  contentPieces: defineTable({
    jobId: v.id("auditJobs"),
    brandId: v.id("brands"),
    targetId: v.optional(v.id("monitoringTargets")),
    source: v.string(),
    url: v.string(),
    title: v.optional(v.string()),
    text: v.string(),
    imageUrl: v.optional(v.string()),
    scrapedAt: v.number(),
  }).index("by_job", ["jobId"]),

  coherenceResults: defineTable({
    jobId: v.id("auditJobs"),
    contentPieceId: v.id("contentPieces"),
    score: v.number(),
    verdict: v.union(
      v.literal("on_brand"),
      v.literal("needs_review"),
      v.literal("off_brand"),
    ),
    flaggedSentences: v.array(v.string()),
    flagReasons: v.array(v.string()),
    retrievedClauseIds: v.array(v.id("constitutionChunks")),
    retrievedClausesSnapshot: v.array(v.string()),
    rewriteSuggestion: v.string(),
    judgedAt: v.number(),
  }).index("by_job", ["jobId"]),

  brandReports: defineTable({
    jobId: v.id("auditJobs"),
    brandId: v.id("brands"),
    reportDate: v.number(),
    overallScore: v.number(),
    totalPiecesChecked: v.number(),
    piecesOffBrand: v.number(),
    executiveSummary: v.string(),
  })
    .index("by_job", ["jobId"])
    .index("by_brand_date", ["brandId", "reportDate"]),
});
```

---

## 5. Brand Constitution Ingestion Pipeline

This runs when the user uploads their brand guidelines document or pastes raw brand guidelines text.

```ts
// convex/brands.ts

import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";

function chunkText(text: string, chunkSize = 1200, overlap = 240): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize - overlap;
  }
  return chunks.filter((chunk) => chunk.trim().length > 0);
}

export const ingestBrandConstitution = action({
  args: {
    brandId: v.id("brands"),
    rawText: v.string(),
  },
  handler: async (ctx, { brandId, rawText }) => {
    const chunks = chunkText(rawText);

    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: chunks,
    });

    await ctx.runMutation(internal.brands.storeConstitutionChunks, {
      brandId,
      rawText,
      chunks: chunks.map((text, index) => ({
        text,
        chunkIndex: index,
        embedding: embeddings[index],
      })),
    });

    return { chunksStored: chunks.length };
  },
});

export const storeConstitutionChunks = internalMutation({
  args: {
    brandId: v.id("brands"),
    rawText: v.string(),
    chunks: v.array(
      v.object({
        text: v.string(),
        chunkIndex: v.number(),
        embedding: v.array(v.float64()),
      }),
    ),
  },
  handler: async (ctx, { brandId, rawText, chunks }) => {
    await ctx.db.patch(brandId, { rawConstitutionText: rawText });

    for (const chunk of chunks) {
      await ctx.db.insert("constitutionChunks", {
        brandId,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        embedding: chunk.embedding,
        createdAt: Date.now(),
      });
    }
  },
});
```

Given a piece of content, retrieve the most relevant Brand Constitution clauses using Convex vector search.

```ts
// convex/rag.ts

import { v } from "convex/values";
import { action } from "./_generated/server";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

export const retrieveRelevantClauses = action({
  args: {
    brandId: v.id("brands"),
    contentText: v.string(),
    topK: v.optional(v.number()),
  },
  handler: async (ctx, { brandId, contentText, topK }) => {
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: contentText,
    });

    const results = await ctx.vectorSearch("constitutionChunks", "by_embedding", {
      vector: embedding,
      limit: topK ?? 5,
      filter: (q) => q.eq("brandId", brandId),
    });

    const chunks = [];
    for (const result of results) {
      const chunk = await ctx.db.get(result._id);
      if (chunk) chunks.push(chunk);
    }

    return chunks.map((chunk) => ({
      id: chunk._id,
      text: chunk.text,
    }));
  },
});
```

---

## 6. Convex Agent Definitions

All AI tasks run through Convex Agent. NarrativeGuard uses agents for orchestration, judgment, and report synthesis.

```ts
// convex/agents.ts

import { Agent } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { openai } from "@ai-sdk/openai";
import { stepCountIs } from "ai";
import {
  scrapeWebsiteTool,
  fetchRssFeedTool,
  fetchFacebookPostsTool,
  retrieveBrandClausesTool,
  judgeContentTool,
  sendSlackAlertTool,
  finalizeReportTool,
} from "./tools";

export const narrativeGuardAgent = new Agent(components.agent, {
  name: "NarrativeGuard Orchestrator",
  languageModel: openai.chat("gpt-4o"),
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  instructions: `You are NarrativeGuard, an AI brand voice auditor.

Your job when given a brand and monitoring targets:
1. Collect recently published content from every target.
2. For each content piece, retrieve relevant Brand Constitution clauses.
3. Judge each piece individually for brand voice coherence.
4. Send a Slack alert when score is below the configured threshold.
5. Produce a structured final report.

Always collect content before judging it. Check every piece individually.
Return concise, decision-ready audit findings.`,
  tools: {
    scrapeWebsite: scrapeWebsiteTool,
    fetchRssFeed: fetchRssFeedTool,
    fetchFacebookPosts: fetchFacebookPostsTool,
    retrieveBrandClauses: retrieveBrandClausesTool,
    judgeContent: judgeContentTool,
    sendSlackAlert: sendSlackAlertTool,
    finalizeReport: finalizeReportTool,
  },
  stopWhen: stepCountIs(25),
});

export const brandJudgeAgent = new Agent(components.agent, {
  name: "Brand Coherence Judge",
  languageModel: openai.chat("gpt-4o"),
  instructions: `You are a strict brand voice auditor.

Given content and retrieved Brand Constitution clauses:
1. Score brand coherence from 0 to 100.
2. Identify exact sentences that drift from the brand voice.
3. Explain why each sentence drifts.
4. Write a full compliant rewrite.

Scoring guide:
80-100 = on_brand
50-79 = needs_review
0-49 = off_brand`,
});

export const reportAgent = new Agent(components.agent, {
  name: "Brand Report Synthesizer",
  languageModel: openai.chat("gpt-4o"),
  instructions: `You synthesize brand audit results into a concise executive summary.
Focus on the risk, recurring patterns, and concrete next action.`,
});
```

---

## 7. Convex Agent Tools

These are the tools available to the Convex Agent during the audit workflow.

```ts
// convex/tools.ts

import { createTool } from "@convex-dev/agent";
import { z } from "zod/v3";
import * as cheerio from "cheerio";
import { internal } from "./_generated/api";

export const scrapeWebsiteTool = createTool({
  description:
    "Scrape text content from a website URL. Returns main body text, stripping nav and footer where possible.",
  args: z.object({
    url: z.string(),
    selector: z.string().optional(),
    jobId: z.string(),
    brandId: z.string(),
    targetId: z.string().optional(),
  }),
  handler: async (ctx, args) => {
    const res = await fetch(args.url, {
      headers: { "User-Agent": "NarrativeGuard/1.0" },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const selected = args.selector ? $(args.selector) : $("main");
    const text = (selected.text() || $("body").text())
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    return await ctx.runMutation(internal.audits.storeContentPiece, {
      jobId: args.jobId as any,
      brandId: args.brandId as any,
      targetId: args.targetId as any,
      source: "website",
      url: args.url,
      text,
      scrapedAt: Date.now(),
    });
  },
});

export const fetchRssFeedTool = createTool({
  description: "Parse an RSS/Atom feed URL and store the latest entries as content pieces.",
  args: z.object({
    feedUrl: z.string(),
    limit: z.number().default(5),
    jobId: z.string(),
    brandId: z.string(),
    targetId: z.string().optional(),
  }),
  handler: async (ctx, args) => {
    const res = await fetch(args.feedUrl);
    const xml = await res.text();
    const $ = cheerio.load(xml, { xmlMode: true });
    const items = $("item")
      .slice(0, args.limit)
      .map((_, item) => {
        const node = $(item);
        return {
          title: node.find("title").text(),
          url: node.find("link").text(),
          text: node.find("description").text().replace(/\s+/g, " ").trim(),
        };
      })
      .get();

    const stored = [];
    for (const item of items) {
      stored.push(
        await ctx.runMutation(internal.audits.storeContentPiece, {
          jobId: args.jobId as any,
          brandId: args.brandId as any,
          targetId: args.targetId as any,
          source: "rss",
          url: item.url || args.feedUrl,
          title: item.title,
          text: item.text,
          scrapedAt: Date.now(),
        }),
      );
    }
    return stored;
  },
});

export const fetchFacebookPostsTool = createTool({
  description: "Fetch the last N public Facebook posts for a brand page using Apify.",
  args: z.object({
    pageUrl: z.string(),
    limit: z.number().default(10),
    jobId: z.string(),
    brandId: z.string(),
    targetId: z.string().optional(),
  }),
  handler: async (ctx, args) => {
    const token = process.env.APIFY_TOKEN;
    if (!token) throw new Error("APIFY_TOKEN is not configured");

    const res = await fetch(
      `https://api.apify.com/v2/acts/apify~facebook-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startUrls: [{ url: args.pageUrl }],
          maxPosts: args.limit,
          maxPostComments: 0,
        }),
      },
    );

    const posts = (await res.json()) as Array<{ text?: string; url?: string }>;
    const stored = [];
    for (const post of posts) {
      stored.push(
        await ctx.runMutation(internal.audits.storeContentPiece, {
          jobId: args.jobId as any,
          brandId: args.brandId as any,
          targetId: args.targetId as any,
          source: "facebook",
          url: post.url ?? args.pageUrl,
          text: post.text ?? "",
          scrapedAt: Date.now(),
        }),
      );
    }
    return stored;
  },
});
```

The remaining tools call Convex functions and Convex agents to retrieve clauses, judge content, send Slack alerts, and finalize the report.

---

## 8. Coherence Judgment with Convex Agent

```ts
// convex/judge.ts

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { brandJudgeAgent } from "./agents";
import { z } from "zod/v3";

const CoherenceResult = z.object({
  score: z.number().int().min(0).max(100),
  verdict: z.enum(["on_brand", "needs_review", "off_brand"]),
  flaggedSentences: z.array(z.string()),
  flagReasons: z.array(z.string()),
  rewriteSuggestion: z.string(),
});

export const judgeContentPiece = action({
  args: {
    jobId: v.id("auditJobs"),
    contentPieceId: v.id("contentPieces"),
    brandName: v.string(),
    contentText: v.string(),
    retrievedClauses: v.array(
      v.object({
        id: v.id("constitutionChunks"),
        text: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const prompt = `Brand: ${args.brandName}

BRAND CONSTITUTION CLAUSES:
${args.retrievedClauses.map((clause) => `- ${clause.text}`).join("\n")}

CONTENT TO EVALUATE:
${args.contentText}

Return a strict JSON object with score, verdict, flaggedSentences, flagReasons, and rewriteSuggestion.`;

    const result = await brandJudgeAgent.generateObject(
      ctx,
      {},
      {
        prompt,
        schema: CoherenceResult,
      },
    );

    return await ctx.runMutation(internal.audits.storeCoherenceResult, {
      jobId: args.jobId,
      contentPieceId: args.contentPieceId,
      score: result.object.score,
      verdict: result.object.verdict,
      flaggedSentences: result.object.flaggedSentences,
      flagReasons: result.object.flagReasons,
      retrievedClauseIds: args.retrievedClauses.map((clause) => clause.id),
      retrievedClausesSnapshot: args.retrievedClauses.map((clause) => clause.text),
      rewriteSuggestion: result.object.rewriteSuggestion,
      judgedAt: Date.now(),
    });
  },
});
```

---

## 9. Audit Orchestrator

This is the heart of the system. It creates an audit job, schedules background execution, scrapes all sources, performs RAG, runs Convex Agent judgment, stores results, sends alerts, and writes the final report.

```ts
// convex/audits.ts

import { v } from "convex/values";
import { action, internalMutation, mutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { narrativeGuardAgent, reportAgent } from "./agents";

export const startAudit = mutation({
  args: {
    brandId: v.id("brands"),
    targetIds: v.optional(v.array(v.id("monitoringTargets"))),
    slackWebhook: v.optional(v.string()),
    alertThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("auditJobs", {
      brandId: args.brandId,
      status: "queued",
      slackWebhook: args.slackWebhook,
      alertThreshold: args.alertThreshold ?? 70,
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.audits.runAudit, { jobId });
    return { jobId, status: "queued" };
  },
});

export const runAudit = action({
  args: { jobId: v.id("auditJobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.runQuery(api.reports.getAuditJob, { jobId });
    if (!job) throw new Error("Audit job not found");

    const brand = await ctx.runQuery(api.brands.getBrand, { brandId: job.brandId });
    const targets = await ctx.runQuery(api.brands.listEnabledTargets, {
      brandId: job.brandId,
    });

    const { threadId, thread } = await narrativeGuardAgent.createThread(ctx);
    await ctx.runMutation(internal.audits.markJobStatus, {
      jobId,
      status: "scraping",
      agentThreadId: threadId,
    });

    await thread.generateText({
      prompt: `Run a NarrativeGuard audit.

Brand: ${brand.name}
Brand ID: ${job.brandId}
Job ID: ${jobId}
Alert threshold: ${job.alertThreshold}
Slack webhook configured: ${Boolean(job.slackWebhook)}

Targets:
${JSON.stringify(targets, null, 2)}

Use your tools to scrape content, retrieve brand clauses, judge each content piece, send alerts when needed, and finalize the report.`,
    });

    await ctx.runMutation(internal.audits.markJobStatus, {
      jobId,
      status: "complete",
      completedAt: Date.now(),
    });
  },
});

export const finalizeReport = action({
  args: { jobId: v.id("auditJobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.runQuery(api.reports.getAuditJob, { jobId });
    if (!job) throw new Error("Audit job not found");

    const results = await ctx.runQuery(api.reports.listResultsForJob, { jobId });
    const scores = results.map((result) => result.score);
    const overallScore =
      scores.length === 0
        ? 100
        : Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) /
          10;

    const summary = await reportAgent.generateText(ctx, {}, {
      prompt: `Create an executive summary for this brand coherence report:
${JSON.stringify({ overallScore, results }, null, 2)}`,
    });

    return await ctx.runMutation(internal.audits.storeBrandReport, {
      jobId,
      brandId: job.brandId,
      reportDate: Date.now(),
      overallScore,
      totalPiecesChecked: results.length,
      piecesOffBrand: results.filter((result) => result.verdict === "off_brand").length,
      executiveSummary: summary.text,
    });
  },
});
```

---

## 10. Frontend (Next.js) — Key Pages

### Page 1: Brand Setup (`/setup`)

```tsx
// app/setup/page.tsx
"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SetupPage() {
  const [brandName, setBrandName] = useState("");
  const [rawText, setRawText] = useState("");
  const [status, setStatus] = useState("");

  const createBrand = useMutation(api.brands.createBrand);
  const ingestBrandConstitution = useAction(api.brands.ingestBrandConstitution);

  const handleIngest = async () => {
    if (!brandName || !rawText) return;
    setStatus("Ingesting brand constitution...");

    const brandId = await createBrand({
      name: brandName,
      toneDescriptors: [],
      messagingPillars: [],
      bannedPhrases: [],
      approvedExamples: [],
    });

    const result = await ingestBrandConstitution({ brandId, rawText });
    setStatus(`Stored ${result.chunksStored} knowledge chunks for ${brandName}`);
  };

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-medium">Set up brand</h1>
      <input
        value={brandName}
        onChange={(event) => setBrandName(event.target.value)}
        placeholder="Brand name"
        className="mb-4 w-full rounded-lg border p-3"
      />
      <textarea
        value={rawText}
        onChange={(event) => setRawText(event.target.value)}
        placeholder="Paste brand guidelines, tone of voice, messaging pillars, and banned phrases"
        className="mb-4 min-h-64 w-full rounded-lg border p-3"
      />
      <button onClick={handleIngest} className="rounded-lg bg-black px-6 py-3 text-white">
        Ingest brand constitution
      </button>
      {status && <p className="mt-4 text-sm">{status}</p>}
    </main>
  );
}
```

### Page 2: Audit Dashboard (`/audit`)

```tsx
// app/audit/page.tsx
"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

const scoreColor = (score: number) =>
  score >= 80 ? "text-green-600" : score >= 50 ? "text-amber-500" : "text-red-600";

export default function AuditPage() {
  const [brandId, setBrandId] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);

  const brands = useQuery(api.brands.listBrands);
  const report = useQuery(
    api.reports.getReportBundle,
    jobId ? { jobId: jobId as any } : "skip",
  );
  const startAudit = useMutation(api.audits.startAudit);

  const handleStart = async () => {
    const result = await startAudit({ brandId: brandId as any, alertThreshold: 70 });
    setJobId(result.jobId);
  };

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-medium">Run brand audit</h1>

      <div className="mb-8 flex gap-2">
        <select
          value={brandId}
          onChange={(event) => setBrandId(event.target.value)}
          className="flex-1 rounded-lg border p-3"
        >
          <option value="">Select brand</option>
          {brands?.map((brand) => (
            <option key={brand._id} value={brand._id}>
              {brand.name}
            </option>
          ))}
        </select>
        <button onClick={handleStart} className="rounded-lg bg-black px-6 py-3 text-white">
          Start audit
        </button>
      </div>

      {report?.job && (
        <div className="mb-6 rounded-lg border p-4">
          <p className="text-xs uppercase text-gray-500">Status</p>
          <p className="text-lg font-medium">{report.job.status}</p>
        </div>
      )}

      {report?.report && (
        <section>
          <div className="mb-6 rounded-lg border p-4">
            <p className="text-xs uppercase text-gray-500">Overall score</p>
            <p className={`text-4xl font-medium ${scoreColor(report.report.overallScore)}`}>
              {report.report.overallScore}
            </p>
            <p className="mt-3 text-sm">{report.report.executiveSummary}</p>
          </div>

          {report.results.map((result) => (
            <article key={result._id} className="mb-4 rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className={`text-2xl font-medium ${scoreColor(result.score)}`}>
                  {result.score}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                  {result.verdict.replace("_", " ")}
                </span>
              </div>

              {result.flaggedSentences.map((sentence, index) => (
                <div key={sentence} className="mb-2 border-l-2 border-red-400 bg-red-50 px-3 py-2">
                  <p className="text-sm text-red-800">{sentence}</p>
                  <p className="text-xs text-red-600">{result.flagReasons[index]}</p>
                </div>
              ))}

              <details className="text-sm">
                <summary className="cursor-pointer text-gray-500">Suggested rewrite</summary>
                <p className="mt-2 rounded-lg bg-green-50 p-3 text-green-800">
                  {result.rewriteSuggestion}
                </p>
              </details>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
```

---

## 11. Project File Structure

```txt
narrativeguard/
├── app/
│   ├── page.tsx
│   ├── setup/page.tsx
│   ├── audit/page.tsx
│   └── history/page.tsx
│
├── components/
│   ├── ScoreRing.tsx
│   ├── FlaggedSentence.tsx
│   └── CoherenceCard.tsx
│
├── convex/
│   ├── convex.config.ts          # Installs Convex Agent component
│   ├── schema.ts                 # Convex tables + vector index
│   ├── agents.ts                 # Convex Agent definitions
│   ├── tools.ts                  # Convex Agent tools
│   ├── brands.ts                 # Brand setup + constitution ingestion
│   ├── rag.ts                    # Vector retrieval over constitution chunks
│   ├── audits.ts                 # Audit jobs + background workflow
│   ├── judge.ts                  # Coherence judgment action
│   ├── reports.ts                # Reactive report queries
│   ├── crons.ts                  # Recurring audits
│   └── _generated/
│
├── sample_data/
│   ├── sample_brand_constitution.txt
│   └── sample_audit_targets.json
│
├── package.json
├── next.config.ts
└── tailwind.config.ts
```

---

## 12. Environment Variables

```bash
# .env.local
CONVEX_DEPLOYMENT=dev:...
NEXT_PUBLIC_CONVEX_URL=https://...

# Convex environment variables
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
APIFY_TOKEN=apify_api_...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

Convex secrets should be configured with:

```bash
npx convex env set OPENAI_API_KEY sk-...
npx convex env set APIFY_TOKEN apify_api_...
npx convex env set SLACK_WEBHOOK_URL https://hooks.slack.com/services/...
```

---

## 13. Dependencies (`package.json`)

```json
{
  "name": "narrativeguard-convex",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "convex": "convex dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^2.0.0",
    "@ai-sdk/openai": "^2.0.0",
    "@convex-dev/agent": "^0.2.0",
    "ai": "^5.0.0",
    "cheerio": "^1.0.0",
    "convex": "^1.28.0",
    "mammoth": "^1.8.0",
    "next": "^15.0.0",
    "pdf-parse": "^1.1.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/pdf-parse": "^1.1.4",
    "eslint": "^9.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.8.0"
  }
}
```

---

## 14. Convex Agent Component Setup

```ts
// convex/convex.config.ts

import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";

const app = defineApp();
app.use(agent);

export default app;
```

After installing the component:

```bash
npm install @convex-dev/agent
npx convex dev
```

---

## 15. Scheduler (Daily Brand Monitor)

```ts
// convex/crons.ts

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "daily brand audits",
  { hourUTC: 2, minuteUTC: 0 },
  internal.audits.runScheduledAudits,
);

export default crons;
```

```ts
// convex/audits.ts

export const runScheduledAudits = internalAction({
  args: {},
  handler: async (ctx) => {
    const brands = await ctx.runQuery(api.brands.listBrandsWithEnabledTargets);

    for (const brand of brands) {
      const job = await ctx.runMutation(api.audits.startAudit, {
        brandId: brand._id,
        alertThreshold: 70,
      });
      console.log(`Scheduled audit started for ${brand.name}: ${job.jobId}`);
    }
  },
});
```

---

## 16. 7-Day Build Plan

| Day | Goal | Done when... |
|-----|------|--------------|
| **Day 1** | Scaffold Next.js + Convex + Convex Agent | `npx convex dev` runs, Agent component is installed, schema compiles |
| **Day 2** | Brand setup + constitution ingestion | User can create a brand and store constitution chunks in Convex |
| **Day 3** | Convex vector RAG working end-to-end | Given content text, Convex retrieves relevant brand clauses by vector search |
| **Day 4** | Convex Agent judgment flow | One content piece produces a stored score, flags, reasons, and rewrite |
| **Day 5** | Full audit workflow | `startAudit` scrapes targets, judges every piece, stores results, and updates job status live |
| **Day 6** | Frontend results UI + report history | Dashboard shows live job status, score cards, flags, rewrites, and previous reports |
| **Day 7** | Slack alerts + scheduled audits + demo polish | Live demo runs in under 90 seconds with a real brand and visible Slack alert |

---

## 17. Demo Script (90-second live demo)

1. "We've pre-loaded **Grameenphone's** brand guidelines — tone of voice, messaging pillars, banned phrases, and approved examples."
2. Open the NarrativeGuard dashboard. The brand and monitoring targets are already stored in Convex.
3. Click **Start Audit** — targets: `grameenphone.com/blog`, an RSS feed, and a Facebook page source.
4. Watch the UI update live as the Convex job moves from `queued` to `scraping` to `judging` to `complete`.
5. Results appear: **Overall score: 74/100** — 2 pieces flagged.
6. Expand a flagged post and show the exact sentence: *"Get this cheap data plan now"*.
7. Show the retrieved Brand Constitution clause: *"Never use cheap; position on value, access, and trust."*
8. Show the Convex Agent rewrite: *"Get exceptional value on this data plan today."*
9. Show the Slack alert that fired automatically when the score fell below the threshold.

**Total time: ~75 seconds. Fully live. Convex stores the data, runs the agents, powers RAG, and updates the UI in real time.**

---

## 18. Implementation Notes

- Convex vector search is available from Convex actions, so RAG retrieval should happen inside actions or agent tools.
- Convex mutations should handle durable writes only; scraping, embeddings, LLM calls, Slack calls, and document parsing should happen in actions.
- The UI should use Convex queries for live job state instead of polling an HTTP endpoint.
- Agent threads should be stored on `auditJobs.agentThreadId` so the audit trace can be inspected or continued.
- Large uploaded documents should go through Convex storage first, then an action should parse and ingest them.
- Slack webhooks should be stored as environment secrets or encrypted brand settings, not passed around the frontend after setup.

---

## 19. Source Notes

This plan uses the current Convex Agent model: agents are defined with `@convex-dev/agent`, installed through `convex/convex.config.ts`, and can be called from Convex actions with persistent threads, tools, text generation, object generation, and embeddings. Convex vector indexes are used for Brand Constitution RAG, with `ctx.vectorSearch` running inside Convex actions.

References:
- Convex Agent docs: https://docs.convex.dev/agents
- Agent usage: https://docs.convex.dev/agents/agent-usage
- Agent getting started: https://docs.convex.dev/agents/getting-started
- Convex components: https://docs.convex.dev/components/using-components
- Convex vector search: https://docs.convex.dev/search/vector-search
