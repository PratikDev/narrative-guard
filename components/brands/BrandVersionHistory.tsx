"use client";

import { useQuery } from "convex/react";

import { BrandVersionPreviewDialog } from "@/components/brands/BrandVersionPreviewDialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDate, formatUserDisplay } from "@/lib/format";

export function BrandVersionHistory({
	brandId,
}: {
	brandId: Id<"brands">;
}) {
	const versions = useQuery(api.brand.listConstitutionVersions, { brandId });

	return (
		<Card className="rounded-lg">
			<CardHeader>
				<CardTitle>Constitution history</CardTitle>
				<CardDescription>
					Review previous constitution versions for this brand.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{versions === undefined ? (
					<p className="text-sm text-muted-foreground">
						Loading constitution history...
					</p>
				) : versions.length ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Version</TableHead>
								<TableHead>Updated by</TableHead>
								<TableHead>Updated date</TableHead>
								<TableHead className="text-right">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{versions.map((version) => (
								<TableRow key={version.id}>
									<TableCell className="font-medium">
										v{version.version}
									</TableCell>
									<TableCell>{formatUserDisplay(version.editor)}</TableCell>
									<TableCell>{formatDate(version.createdAt)}</TableCell>
									<TableCell className="text-right">
										<BrandVersionPreviewDialog versionId={version.id} />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<p className="text-sm text-muted-foreground">
						No constitution versions have been saved yet.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
