export const APP_ROUTES = {
	home: "/",
	docs: "/docs",
	dashboard: "/dashboard",
	scoring: "/scoring",
	signIn: "/signin",
	setup: "/setup",
	audit: "/audit",
	history: "/history",
	team: "/team",
	analytics: "/analytics",
} as const;

export const PUBLIC_SHELL_ROUTES = [
	APP_ROUTES.home,
	APP_ROUTES.docs,
	APP_ROUTES.scoring,
	APP_ROUTES.signIn,
] as const;

export function getSafeInternalRedirectPath(path: string | null) {
	if (!path || !path.startsWith("/") || path.startsWith("//")) {
		return APP_ROUTES.dashboard;
	}

	if (path.startsWith(APP_ROUTES.signIn)) {
		return APP_ROUTES.dashboard;
	}

	return path;
}
