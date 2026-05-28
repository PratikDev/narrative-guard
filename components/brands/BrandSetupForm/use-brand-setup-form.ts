"use client";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

type BrandSetupFormStatus = "idle" | "loading" | "success" | "error";

type UseBrandSetupFormOptions = {
	brand?: Doc<"brands">;
};

export function useBrandSetupForm({ brand }: UseBrandSetupFormOptions) {
	const brands = useQuery(api.brand.listBrands, {});
	const createBrand = useMutation(api.brand.createBrand);
	const updateBrand = useMutation(api.brand.updateBrand);
	const isEditing = Boolean(brand);
	const [name, setName] = useState(brand?.name ?? "");
	const [constitution, setConstitution] = useState(brand?.constitution ?? "");
	const [savedBrandId, setSavedBrandId] = useState<Doc<"brands">["_id"] | null>(
		brand?._id ?? null,
	);
	const [state, setState] = useState<BrandSetupFormStatus>("idle");
	const savedBrand =
		brands?.find((brandItem) => brandItem._id === savedBrandId) ??
		(brand && brand._id === savedBrandId ? brand : undefined) ??
		null;

	async function saveBrand() {
		if (!name.trim() || !constitution.trim()) {
			setState("error");
			return;
		}

		setState("loading");
		try {
			const result =
				isEditing && brand
					? await updateBrand({
							brandId: brand._id,
							name,
							constitution,
						})
					: await createBrand({
							name,
							constitution,
						});
			setSavedBrandId(result.brandId);
			setState("success");
		} catch {
			setState("error");
		}
	}

	return {
		brands,
		constitution,
		isEditing,
		name,
		saveBrand,
		savedBrand,
		setConstitution,
		setName,
		state,
	};
}
