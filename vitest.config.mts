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
		// Phase 1: pure-logic suites only. Later phases add the convex-test
		// (edge-runtime) and component (jsdom) projects.
		include: ["lib/**/*.test.ts", "convex/lib/**/*.test.ts"],
		coverage: {
			provider: "v8",
			// Phase 1 owns pure logic only. Later phases widen this list as their
			// suites land (workspaceAuth DB helpers, notificationHelpers, ...).
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
				"convex/lib/auditContentTypes.ts",
				"convex/lib/auditScoring.ts",
			],
		},
	},
});
