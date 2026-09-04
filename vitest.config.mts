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
		// Convex functions run in an edge-runtime-like environment for real, so
		// convex-test suites opt into it per-file with a leading
		// `// @vitest-environment edge-runtime` comment instead of switching the
		// whole run over.
		// Phase 1 (lib/, convex/lib pure fns) + Phase 2 (convex-test backend
		// suites). Phase 3 adds a jsdom component project.
		include: ["lib/**/*.test.ts", "convex/**/*.test.ts"],
		server: {
			deps: { inline: ["convex-test"] },
		},
		coverage: {
			provider: "v8",
			// Widened from Phase 1's pure-logic-only list to include the backend
			// function files now covered by convex-test. Phase 3 adds components.
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
