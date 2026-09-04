// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
	it("labels each verdict and gives it a distinct tone", () => {
		render(<StatusBadge verdict="on_brand" />);
		expect(screen.getByText("On Brand")).toHaveClass("bg-emerald-50");

		render(<StatusBadge verdict="needs_review" />);
		expect(screen.getByText("Needs Review")).toHaveClass("bg-amber-50");

		render(<StatusBadge verdict="off_brand" />);
		expect(screen.getByText("Off Brand")).toHaveClass("bg-red-50");
	});
});
