"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
	BRAND_RAG_STATUS_LABELS,
	normalizeBrandRagStatus,
} from "@/lib/brand-status";

export function BrandSelector({
	brands,
	value,
	onValueChange,
	readyOnly = false,
}: {
	brands: Doc<"brands">[];
	value: Id<"brands"> | "";
	onValueChange: (value: Id<"brands">) => void;
	readyOnly?: boolean;
}) {
	const activeBrand = brands.find((brand) => brand._id === value);

	return (
		<Select
			value={activeBrand?._id || ""}
			onValueChange={(nextValue) => {
				if (nextValue) onValueChange(nextValue as Id<"brands">);
			}}
		>
			<SelectTrigger className="w-full">
				<SelectValue placeholder="Select brand" />
			</SelectTrigger>
			<SelectContent>
				{brands.map((brand) => (
					<SelectItem
						key={brand._id}
						value={brand._id}
						disabled={readyOnly && normalizeBrandRagStatus(brand.ragStatus) !== "ready"}
					>
						{brand.name}
						{readyOnly && normalizeBrandRagStatus(brand.ragStatus) !== "ready"
							? ` (${BRAND_RAG_STATUS_LABELS[normalizeBrandRagStatus(brand.ragStatus)]})`
							: ""}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
