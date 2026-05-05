# NarrativeGuard Docs

NarrativeGuard is an AI brand voice coherence system built on Convex. It monitors published brand content, compares each item against a stored Brand Constitution, scores brand alignment, flags drift, and generates on-brand rewrites.

## Documents

- [Convex Architecture Plan](./architecture.md)  
  System architecture, major components, data flow, Convex responsibilities, Agent responsibilities, and external integrations.

- [Scoring System](./scoring-system.md)  
  How content is scored, what dimensions contribute to the score, penalty caps, verdict thresholds, and report-level scoring.

- [Full Convex Technical Specification](./narrativeguard_convex_tech_spec.md)  
  Full implementation-oriented spec with schema, agents, tools, frontend pages, scheduler, and 7-day build plan.

## Core Stack

| Area | Tool |
|---|---|
| Frontend | Next.js, Tailwind, `convex/react` |
| Backend | Convex functions |
| Database | Convex document database |
| Vector search | Convex vector indexes |
| AI orchestration | Convex Agent component |
| Model providers | AI SDK providers such as OpenAI or Anthropic |
| Background jobs | Convex scheduler |
| Recurring audits | Convex cron jobs |
| Notifications | Slack webhook |
| Social scraping | Apify |

