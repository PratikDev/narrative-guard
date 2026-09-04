// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScoreDisplay } from "./ScoreDisplay";

describe("ScoreDisplay", () => {
	it("renders the score out of 100", () => {
		render(<ScoreDisplay score={87} />);
		expect(screen.getByText("87")).toBeInTheDocument();
		expect(screen.getByText("/100")).toBeInTheDocument();
	});

	it("colors the score by the same bands the backend verdict uses", () => {
		render(<ScoreDisplay score={90} />);
		expect(screen.getByText("90")).toHaveClass("text-emerald-700");

		render(<ScoreDisplay score={40} />);
		expect(screen.getByText("40")).toHaveClass("text-red-700");
	});

	it("sizes the digits according to the size prop", () => {
		render(<ScoreDisplay score={50} size="lg" />);
		expect(screen.getByText("50")).toHaveClass("text-5xl");
	});
});
