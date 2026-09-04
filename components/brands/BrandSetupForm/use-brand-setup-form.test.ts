// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Doc } from "@/convex/_generated/dataModel";
import { useBrandSetupForm } from "./use-brand-setup-form";

const refs = vi.hoisted(() => ({
	listBrands: Symbol("listBrands"),
	createBrand: Symbol("createBrand"),
	updateBrand: Symbol("updateBrand"),
}));

const mocks = vi.hoisted(() => ({
	activeMembership: { role: "owner" } as { role: "owner" | "admin" | "member" },
	workspaceId: "ws_1",
	brands: [] as unknown[],
	createBrand: vi.fn(),
	updateBrand: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		brand: {
			listBrands: refs.listBrands,
			createBrand: refs.createBrand,
			updateBrand: refs.updateBrand,
		},
	},
}));

vi.mock("convex/react", () => ({
	useQuery: () => mocks.brands,
	useMutation: (ref: unknown) => {
		if (ref === refs.createBrand) return mocks.createBrand;
		if (ref === refs.updateBrand) return mocks.updateBrand;
		return vi.fn();
	},
}));

vi.mock("@/components/providers/WorkspaceProvider", () => ({
	useWorkspace: () => ({
		activeMembership: mocks.activeMembership,
		workspaceId: mocks.workspaceId,
	}),
}));

beforeEach(() => {
	mocks.activeMembership = { role: "owner" };
	mocks.workspaceId = "ws_1";
	mocks.brands = [];
	mocks.createBrand.mockReset();
	mocks.updateBrand.mockReset();
});

describe("useBrandSetupForm", () => {
	it("blocks saving for a member who cannot manage brands", async () => {
		mocks.activeMembership = { role: "member" };
		const { result } = renderHook(() => useBrandSetupForm({}));

		act(() => result.current.setName("Acme"));
		act(() => result.current.setConstitution("Be warm."));
		await act(async () => {
			await result.current.saveBrand();
		});

		expect(result.current.state).toBe("error");
		expect(mocks.createBrand).not.toHaveBeenCalled();
	});

	it("rejects blank name or constitution", async () => {
		const { result } = renderHook(() => useBrandSetupForm({}));

		await act(async () => {
			await result.current.saveBrand();
		});

		expect(result.current.state).toBe("error");
		expect(mocks.createBrand).not.toHaveBeenCalled();
	});

	it("creates a new brand with the current workspace, name, and constitution", async () => {
		mocks.createBrand.mockResolvedValue({ brandId: "brand_1" });
		const { result } = renderHook(() => useBrandSetupForm({}));

		act(() => result.current.setName("Acme"));
		act(() => result.current.setConstitution("Be warm and confident."));
		await act(async () => {
			await result.current.saveBrand();
		});

		expect(mocks.createBrand).toHaveBeenCalledWith({
			workspaceId: "ws_1",
			name: "Acme",
			constitution: "Be warm and confident.",
		});
		expect(mocks.updateBrand).not.toHaveBeenCalled();
		expect(result.current.state).toBe("success");
	});

	it("updates the existing brand when editing", async () => {
		const brand = { _id: "brand_1", name: "Old", constitution: "Old text" } as Doc<"brands">;
		mocks.updateBrand.mockResolvedValue({ brandId: "brand_1" });
		const { result } = renderHook(() => useBrandSetupForm({ brand }));

		expect(result.current.isEditing).toBe(true);
		act(() => result.current.setName("New name"));
		await act(async () => {
			await result.current.saveBrand();
		});

		expect(mocks.updateBrand).toHaveBeenCalledWith({
			workspaceId: "ws_1",
			brandId: "brand_1",
			name: "New name",
			constitution: "Old text",
		});
		expect(mocks.createBrand).not.toHaveBeenCalled();
	});

	it("sets an error state when the mutation throws", async () => {
		mocks.createBrand.mockRejectedValue(new Error("network error"));
		const { result } = renderHook(() => useBrandSetupForm({}));

		act(() => result.current.setName("Acme"));
		act(() => result.current.setConstitution("Be warm."));
		await act(async () => {
			await result.current.saveBrand();
		});

		expect(result.current.state).toBe("error");
	});
});
