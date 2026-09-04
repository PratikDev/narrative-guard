// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
	it("renders the label and value", () => {
		render(<MetricCard label="Total reports" value={42} />);
		expect(screen.getByText("Total reports")).toBeInTheDocument();
		expect(screen.getByText("42")).toBeInTheDocument();
	});

	it("renders the helper text only when provided", () => {
		const { rerender } = render(
			<MetricCard label="Average score" value="87" helper="Last 30 days" />,
		);
		expect(screen.getByText("Last 30 days")).toBeInTheDocument();

		rerender(<MetricCard label="Average score" value="87" />);
		expect(screen.queryByText("Last 30 days")).not.toBeInTheDocument();
	});
});
