"use client";

import { BrandRagStatusBadge } from "@/components/brands/BrandRagStatusBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Doc } from "@/convex/_generated/dataModel";
import { AlertCircle, Pencil, Save } from "lucide-react";
import Link from "next/link";
import { useBrandSetupForm } from "./use-brand-setup-form";

export function BrandSetupForm({ brand }: { brand?: Doc<"brands"> }) {
	const {
		brands,
		canManageBrands,
		constitution,
		isEditing,
		name,
		saveBrand,
		savedBrand,
		setConstitution,
		setName,
		state,
	} = useBrandSetupForm({ brand });

	return (
		<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
			<Card className="rounded-lg">
				<CardHeader>
					<CardTitle>
						{canManageBrands
							? isEditing
								? "Edit brand details"
								: "Brand details"
							: brand
								? brand.name
								: "Brand constitutions"}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{canManageBrands ? (
						<>
							<label className="grid gap-2 text-sm font-medium">
								Brand name
								<Input
									value={name}
									onChange={(event) => setName(event.target.value)}
								/>
							</label>
							<label className="grid gap-2 text-sm font-medium">
								Brand Constitution
								<Textarea
									value={constitution}
									onChange={(event) => setConstitution(event.target.value)}
									className="min-h-80 h-120 resize-y"
								/>
							</label>
							<p className="text-sm leading-6 text-muted-foreground">
								Include tone, messaging pillars, banned phrases, approved
								examples, audience notes, and any review rules the team should
								follow.
							</p>
							<Button
								onClick={saveBrand}
								disabled={state === "loading"}
							>
								<Save className="size-4" />
								{state === "loading"
									? "Saving"
									: isEditing
										? "Update brand"
										: "Save brand"}
							</Button>
						</>
					) : brand ? (
						<div className="space-y-3">
							<BrandRagStatusBadge status={brand.ragStatus} />
							<div className="max-h-140 overflow-auto rounded-lg border bg-muted/30 p-4">
								<p className="whitespace-pre-wrap text-sm leading-6">
									{brand.constitution}
								</p>
							</div>
						</div>
					) : (
						<p className="text-sm leading-6 text-muted-foreground">
							Select a saved brand to read its constitution.
						</p>
					)}
					{state === "success" ? (
						<Alert className="border-primary/40 bg-primary/10">
							<AlertTitle>
								{isEditing ? "Brand updated" : "Brand saved"}
							</AlertTitle>
							<AlertDescription>
								The brand constitution has been saved and queued for RAG
								indexing.
							</AlertDescription>
						</Alert>
					) : null}
					{state === "error" ? (
						<Alert variant="destructive">
							<AlertCircle className="size-4" />
							<AlertTitle>Brand details incomplete</AlertTitle>
							<AlertDescription>
								{canManageBrands
									? "Add a brand name and constitution before saving."
									: "You do not have permission to edit brand details."}
							</AlertDescription>
						</Alert>
					) : null}
				</CardContent>
			</Card>
			<div className="space-y-4">
				<Card className="rounded-lg">
					<CardHeader>
						<CardTitle>RAG indexing</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{savedBrand ? (
							<>
								<BrandRagStatusBadge status={savedBrand.ragStatus} />
								{savedBrand.ragError ? (
									<p className="text-sm leading-6 text-destructive">
										{savedBrand.ragError}
									</p>
								) : (
									<p className="text-sm leading-6 text-muted-foreground">
										The audit engine can use this brand once indexing is ready.
									</p>
								)}
							</>
						) : (
							<p className="text-sm text-muted-foreground">
								Save a brand to start indexing its constitution.
							</p>
						)}
					</CardContent>
				</Card>
				<Card className="rounded-lg">
					<CardHeader>
						<CardTitle>
							{canManageBrands ? "Saved brands" : "Brand constitutions"}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{brands === undefined ? (
							<p className="text-sm text-muted-foreground">Loading brands...</p>
						) : brands.length ? (
							brands.map((brand) => (
								<div
									key={brand._id}
									className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border p-3"
								>
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<p className="text-sm font-medium">{brand.name}</p>
											<BrandRagStatusBadge status={brand.ragStatus} />
										</div>
										<p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
											{brand.constitution}
										</p>
									</div>
									{canManageBrands ? (
										<Button
											variant="ghost"
											size="icon"
											asChild
										>
											<Link
												href={`/setup/${brand._id}`}
												aria-label={`Edit ${brand.name}`}
											>
												<Pencil className="size-4" />
											</Link>
										</Button>
									) : (
										<Button
											variant="outline"
											size="sm"
											asChild
										>
											<Link href={`/setup/${brand._id}`}>Read</Link>
										</Button>
									)}
								</div>
							))
						) : (
							<p className="text-sm text-muted-foreground">
								No brands have been saved yet.
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
