import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
	it("joins truthy class values and drops falsy ones", () => {
		expect(cn("a", "b")).toBe("a b");
		expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
		expect(cn(["a", "b"], "c")).toBe("a b c");
	});

	it("resolves conflicting tailwind utilities in favour of the last one", () => {
		expect(cn("p-2", "p-4")).toBe("p-4");
		expect(cn("text-sm text-muted-foreground", "text-lg")).toBe(
			"text-muted-foreground text-lg",
		);
	});
});
