import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Date-handling code under lib/ and convex/ mixes local-time and UTC calls,
// so pin the runner timezone for deterministic results (CI should also set TZ=UTC).
process.env.TZ = "UTC";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			"@": projectRoot.replace(/\/$/, ""),
		},
	},
	test: {
		environment: "node",
		// Convex functions run in an edge-runtime-like environment for real, and
		// components/hooks need a DOM, so both opt in per-file with a leading
		// `// @vitest-environment edge-runtime` / `jsdom` comment instead of
		// switching the whole run over.
		// Phase 1 (lib/, convex/lib pure fns) + Phase 2 (convex-test backend
		// suites) + Phase 3 (component/hook suites under jsdom).
		include: [
			"lib/**/*.test.ts",
			"convex/**/*.test.ts",
			"components/**/*.test.{ts,tsx}",
			"hooks/**/*.test.ts",
		],
		setupFiles: ["./test/setup.ts"],
		server: {
			deps: { inline: ["convex-test"] },
		},
		coverage: {
			provider: "v8",
			// Widened across the phases: Phase 1 pure logic, Phase 2 backend
			// functions, Phase 3 the specific components/hooks under test.
			include: [
				"lib/analytics-utils.ts",
				"lib/audit-report.ts",
				"lib/audit-scoring-guide.ts",
				"lib/brand-status.ts",
				"lib/constants.ts",
				"lib/format.ts",
				"lib/routes.ts",
				"lib/score.ts",
				"lib/utils.ts",
				"lib/workspace-permissions.ts",
				"convex/lib/**/*.ts",
				"convex/*.ts",
				"components/auth/SignInButton.tsx",
				"components/auth/AuthGate.tsx",
				"components/providers/WorkspaceProvider.tsx",
				"components/history/ReportHistoryDataTable/use-report-history-data-table.ts",
				"components/history/ReportHistoryColumns.tsx",
				"components/brands/BrandSetupForm/use-brand-setup-form.ts",
				"components/audit/AuditForm/use-source-report-prefill.ts",
				"components/audit/OriginalRewriteComparison.tsx",
				"components/shared/ScoreDisplay.tsx",
				"components/shared/StatusBadge.tsx",
				"components/shared/AuditReportStatusBadge.tsx",
				"components/shared/MetricCard.tsx",
				"components/shared/EmptyState.tsx",
			],
			exclude: [
				"**/*.test.ts",
				// Declarative provider/config wiring, not business logic.
				"convex/auth.ts",
				"convex/auth.config.ts",
				"convex/convex.config.ts",
				"convex/http.ts",
				"convex/schema.ts",
			],
		},
	},
});
