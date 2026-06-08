"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDate, formatUserDisplay } from "@/lib/format";

export function BrandVersionPreviewDialog({
	versionId,
}: {
	versionId: Id<"brandConstitutionVersions">;
}) {
	const [open, setOpen] = useState(false);
	const version = useQuery(
		api.brand.getConstitutionVersion,
		open ? { versionId } : "skip",
	);

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
				>
					<Eye data-icon="inline-start" />
					View
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{version ? `Constitution v${version.version}` : "Constitution"}
					</DialogTitle>
					<DialogDescription>
						{version
							? `${version.brandName} · ${formatUserDisplay(version.editor)} · ${formatDate(version.createdAt)}`
							: "Loading constitution version..."}
					</DialogDescription>
				</DialogHeader>
				<Textarea
					value={version?.constitution ?? ""}
					readOnly
					className="h-120 resize-none"
					aria-label="Readonly constitution version"
				/>
			</DialogContent>
		</Dialog>
	);
}
