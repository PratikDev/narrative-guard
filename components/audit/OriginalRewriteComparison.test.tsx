// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { OriginalRewriteComparison } from "./OriginalRewriteComparison";

describe("OriginalRewriteComparison", () => {
	it("shows a 'no changes' message when the original and rewrite are identical", () => {
		render(
			<OriginalRewriteComparison
				original="Same content."
				rewrite="Same content."
			/>,
		);

		expect(
			screen.getByText(/no text changes were detected/i),
		).toBeInTheDocument();
	});

	it("renders removed and added spans when the text differs", () => {
		render(
			<OriginalRewriteComparison
				original="This is a cheap deal."
				rewrite="This is a great deal."
			/>,
		);

		expect(screen.getByText("Removed")).toBeInTheDocument();
		expect(screen.getByText("Added")).toBeInTheDocument();
		expect(screen.getByText("cheap")).toHaveClass("line-through");
		expect(screen.getByText("great")).toHaveClass("underline");
	});

	it("shows both full texts side by side on the 'Side by side' tab", async () => {
		const user = userEvent.setup();
		render(
			<OriginalRewriteComparison
				original="This is a cheap deal."
				rewrite="This is a great deal."
			/>,
		);

		await user.click(screen.getByRole("tab", { name: "Side by side" }));

		expect(screen.getByText("This is a cheap deal.")).toBeInTheDocument();
		expect(screen.getByText("This is a great deal.")).toBeInTheDocument();
	});
});
