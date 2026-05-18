"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Doc, Id } from "@/convex/_generated/dataModel";

export function BrandSelector({
	brands,
	value,
	onValueChange,
}: {
	brands: Doc<"brands">[];
	value: Id<"brands"> | "";
	onValueChange: (value: Id<"brands">) => void;
}) {
	const activeBrand = brands.find((brand) => brand._id === value);

	return (
		<Select
			// name={activeBrand?.name || ""}
			value={activeBrand?._id || ""}
			defaultValue={""}
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
					>
						{brand.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
