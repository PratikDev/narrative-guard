// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthGate } from "./AuthGate";

const mocks = vi.hoisted(() => ({
	pathname: "/dashboard",
	authState: "unauthenticated" as "loading" | "authenticated" | "unauthenticated",
}));

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
	usePathname: () => mocks.pathname,
	useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

vi.mock("convex/react", () => ({
	Authenticated: ({ children }: { children: React.ReactNode }) =>
		mocks.authState === "authenticated" ? <>{children}</> : null,
	Unauthenticated: ({ children }: { children: React.ReactNode }) =>
		mocks.authState === "unauthenticated" ? <>{children}</> : null,
	AuthLoading: ({ children }: { children: React.ReactNode }) =>
		mocks.authState === "loading" ? <>{children}</> : null,
}));

vi.mock("@/components/layout/AppShell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="app-shell">{children}</div>
	),
}));

beforeEach(() => {
	replaceMock.mockReset();
	mocks.pathname = "/dashboard";
	mocks.authState = "unauthenticated";
});

describe("AuthGate", () => {
	it("renders children directly on a public shell route, regardless of auth state", () => {
		mocks.pathname = "/";
		mocks.authState = "loading";

		render(
			<AuthGate>
				<p>Landing content</p>
			</AuthGate>,
		);

		expect(screen.getByText("Landing content")).toBeInTheDocument();
		expect(screen.queryByTestId("app-shell")).not.toBeInTheDocument();
	});

	it("wraps children in the app shell once authenticated", () => {
		mocks.pathname = "/dashboard";
		mocks.authState = "authenticated";

		render(
			<AuthGate>
				<p>Dashboard content</p>
			</AuthGate>,
		);

		expect(screen.getByTestId("app-shell")).toHaveTextContent("Dashboard content");
	});

	it("shows a loading state while the session is resolving", () => {
		mocks.pathname = "/dashboard";
		mocks.authState = "loading";

		render(
			<AuthGate>
				<p>Dashboard content</p>
			</AuthGate>,
		);

		expect(screen.queryByText("Dashboard content")).not.toBeInTheDocument();
		expect(replaceMock).not.toHaveBeenCalled();
	});

	it("redirects home instead of rendering a protected page when unauthenticated", () => {
		mocks.pathname = "/dashboard";
		mocks.authState = "unauthenticated";

		render(
			<AuthGate>
				<p>Dashboard content</p>
			</AuthGate>,
		);

		expect(screen.queryByText("Dashboard content")).not.toBeInTheDocument();
		expect(replaceMock).toHaveBeenCalledWith("/");
	});
});
