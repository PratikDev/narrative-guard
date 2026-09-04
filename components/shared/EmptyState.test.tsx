// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
	it("renders the title and description", () => {
		render(
			<EmptyState
				title="No reports yet"
				description="Run your first audit to see it here."
			/>,
		);
		expect(screen.getByText("No reports yet")).toBeInTheDocument();
		expect(
			screen.getByText("Run your first audit to see it here."),
		).toBeInTheDocument();
	});

	it("renders the action link only when both href and label are given", () => {
		const { rerender } = render(
			<EmptyState
				title="No reports yet"
				description="Run your first audit to see it here."
			/>,
		);
		expect(screen.queryByRole("link")).not.toBeInTheDocument();

		rerender(
			<EmptyState
				title="No reports yet"
				description="Run your first audit to see it here."
				actionHref="/audit"
				actionLabel="Start auditing"
			/>,
		);
		const link = screen.getByRole("link", { name: "Start auditing" });
		expect(link).toHaveAttribute("href", "/audit");
	});
});
