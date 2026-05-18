# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router project. Route entries live in `app/`, including `app/page.tsx`, feature pages such as `app/audit/page.tsx`, and dynamic report routes under `app/reports/[reportId]/`. Shared UI is organized by domain in `components/` (`audit`, `brands`, `dashboard`, `history`, `layout`, `reports`, `shared`) with reusable shadcn components in `components/ui/`. Core helpers, constants, types, scoring logic, and mock data live in `lib/`; hooks live in `hooks/`; static assets live in `public/`; design and product notes live in `docs/`.

## Build, Test, and Development Commands

Use the package scripts in `package.json`:

- `bun install` installs dependencies from `bun.lock`.
- `bun run dev` starts the local Next.js dev server.
- `bun run build` creates a production build.
- `bun run start` serves the production build after `build`.
- `bun run lint` runs ESLint with Next.js core web vitals and TypeScript rules.
- `bun run sad <component>` adds shadcn components through `bunx --bun shadcn@latest add`.

## Coding Style & Naming Conventions

Write TypeScript and TSX with strict compiler settings. Use the `@/*` path alias for repo-root imports. Try to avoid `any` or `unknown` types as much as possible. Keep **EVERYTHING** type-safe. Components use PascalCase filenames and exports, for example `BrandSelector.tsx`; hooks use `use-*` naming, for example `use-mobile.ts`; utility modules use short lowercase names such as `score.ts` and `format.ts`. Keep route UI in `app/` and reusable UI or business presentation in `components/`. Prefer server components by default; add `"use client"` only for browser state, effects, or event handlers. Before changing Next.js APIs, read the relevant installed guide in `node_modules/next/dist/docs/`. Never make a single file too long. Do code splitting with easily manageable/understandable file structure. always follow DRY strategy for everything. Whether it's a type/interface declaration or even a simple utility function. Never write same logic in multiple places. and keep everything easily extensible

## Testing Guidelines

No automated test framework is currently configured. For now, validate changes with `bun run lint` and, for UI behavior, a local `bun run dev` smoke test. When adding tests, colocate them near the code as `*.test.ts` or `*.test.tsx`, and add a matching `test` script to `package.json`.

## Commit & Pull Request Guidelines

Keep commits atomic: commit only the files you touched and list each path explicitly. For tracked files run `git commit -m "<scoped message>" -- path/to/file1 path/to/file2`. For brand-new files, use the one-liner `git restore --staged :/ && git add "path/to/file1" "path/to/file2" && git commit -m "<scoped message>" -- path/to/file1 path/to/file2`. Never change any file content in middle of the committing process. PRs should explain user-visible impact, list Convex/schema or config changes, and link related issues. Pull requests should include a short summary, validation steps, and linked issues when relevant. Note any Convex schema, environment, or migration impact explicitly.

## Security & Configuration Tips

Do not commit secrets or local environment files. Keep generated output such as `.next/`, `out/`, and `build/` out of source control. Treat `lib/mock-data.ts` as development data unless a backend integration explicitly replaces it.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
