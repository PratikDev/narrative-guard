import { describe, expect, it } from "vitest";

import { APP_ROUTES, PUBLIC_SHELL_ROUTES, getSafeInternalRedirectPath } from "./routes";

describe("getSafeInternalRedirectPath", () => {
	it("falls back to the dashboard for missing or non-internal paths", () => {
		expect(getSafeInternalRedirectPath(null)).toBe(APP_ROUTES.dashboard);
		expect(getSafeInternalRedirectPath("")).toBe(APP_ROUTES.dashboard);
		expect(getSafeInternalRedirectPath("dashboard")).toBe(APP_ROUTES.dashboard);
		expect(getSafeInternalRedirectPath("https://evil.example.com")).toBe(
			APP_ROUTES.dashboard,
		);
	});

	it("rejects protocol-relative URLs that start with //", () => {
		expect(getSafeInternalRedirectPath("//evil.example.com")).toBe(
			APP_ROUTES.dashboard,
		);
	});

	it("never redirects back into the sign-in route (avoids a loop)", () => {
		expect(getSafeInternalRedirectPath(APP_ROUTES.signIn)).toBe(
			APP_ROUTES.dashboard,
		);
		expect(getSafeInternalRedirectPath("/signin?next=/team")).toBe(
			APP_ROUTES.dashboard,
		);
	});

	it("passes through a valid internal path unchanged", () => {
		expect(getSafeInternalRedirectPath("/reports/abc123")).toBe("/reports/abc123");
		expect(getSafeInternalRedirectPath(APP_ROUTES.audit)).toBe(APP_ROUTES.audit);
		expect(getSafeInternalRedirectPath("/history?verdict=off_brand")).toBe(
			"/history?verdict=off_brand",
		);
	});
});

describe("route tables", () => {
	it("every public shell route is a known app route", () => {
		const known = new Set(Object.values(APP_ROUTES));
		for (const route of PUBLIC_SHELL_ROUTES) {
			expect(known.has(route)).toBe(true);
		}
	});

	it("keeps the sign-in route public but not the dashboard", () => {
		const publicRoutes = new Set<string>(PUBLIC_SHELL_ROUTES);
		expect(publicRoutes.has(APP_ROUTES.signIn)).toBe(true);
		expect(publicRoutes.has(APP_ROUTES.home)).toBe(true);
		expect(publicRoutes.has(APP_ROUTES.dashboard)).toBe(false);
		expect(publicRoutes.has(APP_ROUTES.audit)).toBe(false);
	});

	it("exposes every route as an absolute path", () => {
		for (const route of Object.values(APP_ROUTES)) {
			expect(route.startsWith("/")).toBe(true);
		}
	});
});
