import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Runs before every test file. Guarded so it stays inert for the plain
// node/edge-runtime suites (lib/, convex/) that don't have a DOM.
afterEach(() => {
	cleanup();
});

// next/font/google is a build-time macro Next.js's compiler rewrites; under
// Vitest the real import isn't callable, so stub the font loaders used by
// lib/fonts.ts with something components can safely read .variable/.className
// from.
vi.mock("next/font/google", () => {
	const mockFont = (opts?: { variable?: string }) => ({
		className: "font-mock",
		variable: opts?.variable ?? "--font-mock",
		style: { fontFamily: "mock" },
	});
	return {
		DM_Sans: mockFont,
		Geist: mockFont,
		Geist_Mono: mockFont,
	};
});

if (typeof globalThis.ResizeObserver === "undefined") {
	class ResizeObserverStub {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	globalThis.ResizeObserver =
		ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (typeof globalThis.IntersectionObserver === "undefined") {
	class IntersectionObserverStub {
		observe() {}
		unobserve() {}
		disconnect() {}
		takeRecords() {
			return [];
		}
	}
	globalThis.IntersectionObserver =
		IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

if (typeof window !== "undefined" && !window.matchMedia) {
	window.matchMedia = (query: string) =>
		({
			matches: false,
			media: query,
			onchange: null,
			addEventListener() {},
			removeEventListener() {},
			addListener() {},
			removeListener() {},
			dispatchEvent() {
				return false;
			},
		}) as unknown as MediaQueryList;
}
