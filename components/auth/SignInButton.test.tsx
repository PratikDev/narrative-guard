// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignInButton } from "./SignInButton";

const signIn = vi.fn();
vi.mock("@convex-dev/auth/react", () => ({
	useAuthActions: () => ({ signIn }),
}));

const toastError = vi.fn();
vi.mock("sonner", () => ({
	toast: { error: (...args: unknown[]) => toastError(...args) },
}));

beforeEach(() => {
	signIn.mockReset();
	toastError.mockReset();
});

describe("SignInButton", () => {
	it("starts Google sign-in with the given redirect path", async () => {
		signIn.mockResolvedValue(undefined);
		const user = userEvent.setup();
		render(<SignInButton redirectTo="/audit">Sign in</SignInButton>);

		await user.click(screen.getByRole("button", { name: "Sign in" }));

		expect(signIn).toHaveBeenCalledWith("google", { redirectTo: "/audit" });
	});

	it("sanitizes an unsafe redirect target before calling signIn", async () => {
		signIn.mockResolvedValue(undefined);
		const user = userEvent.setup();
		render(
			<SignInButton redirectTo="//evil.example.com">Sign in</SignInButton>,
		);

		await user.click(screen.getByRole("button", { name: "Sign in" }));

		expect(signIn).toHaveBeenCalledWith("google", { redirectTo: "/dashboard" });
	});

	it("shows an error toast and re-enables the button when sign-in throws", async () => {
		signIn.mockRejectedValue(new Error("network error"));
		const user = userEvent.setup();
		render(<SignInButton>Sign in</SignInButton>);

		const button = screen.getByRole("button", { name: "Sign in" });
		await user.click(button);

		expect(toastError).toHaveBeenCalledWith(
			"Sign in failed",
			expect.objectContaining({
				description: expect.stringContaining("could not be started"),
			}),
		);
		expect(button).not.toBeDisabled();
	});
});
