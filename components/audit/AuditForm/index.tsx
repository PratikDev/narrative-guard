"use client";

import { BrandSelector } from "@/components/brands/BrandSelector";
import { LoadingState } from "@/components/shared/LoadingState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { normalizeBrandRagStatus } from "@/lib/brand-status";
import { CONTENT_TYPE_LABELS, CONTENT_TYPES } from "@/lib/constants";
import type { ContentType } from "@/lib/types";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle, Play, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DraftsPanel, type EditableAuditDraft } from "./DraftsPanel";
import { useSourceReportPrefill } from "./use-source-report-prefill";

export function AuditForm({
	sourceReportId,
	draftId,
}: {
	sourceReportId?: string;
	draftId?: string;
}) {
	const router = useRouter();
	const { workspaceId } = useWorkspace();
	const workspaceArgs = workspaceId ? { workspaceId } : {};
	const brands = useQuery(api.brand.listBrands, workspaceArgs);
	const createManualAudit = useMutation(api.audit.createManualAudit);
	const createDraft = useMutation(api.auditDraft.createDraft);
	const updateDraft = useMutation(api.auditDraft.updateDraft);
	const runDraftAudit = useMutation(api.auditDraft.runDraftAudit);
	const draftForEditing = useQuery(
		api.auditDraft.getDraftForEditing,
		draftId ? { draftId: draftId as Id<"auditDrafts"> } : "skip",
	);
	const [activeDraftId, setActiveDraftId] = useState<Id<"auditDrafts"> | null>(
		null,
	);
	const [brandId, setBrandId] = useState<Id<"brands"> | "">("");
	const [contentType, setContentType] = useState<ContentType>("generic");
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [status, setStatus] = useState<"idle" | "processing" | "failed">(
		"idle",
	);
	const [draftStatus, setDraftStatus] = useState<"idle" | "saving">("idle");
	const [errorMessage, setErrorMessage] = useState("");
	const prefilledDraftId = useRef<string | null>(null);
	const sourceReportPrefill = useSourceReportPrefill({
		sourceReportId: draftId ? undefined : sourceReportId,
		workspaceId,
		onPrefill: (sourceReport) => {
			setBrandId(sourceReport.brandId);
			setContentType(sourceReport.contentType);
			setContent(sourceReport.rewriteSuggestion);
		},
	});

	useEffect(() => {
		if (!draftForEditing) return;
		if (prefilledDraftId.current === draftForEditing._id) return;

		let isCurrent = true;

		async function prefillDraft() {
			await Promise.resolve();

			if (!isCurrent || !draftForEditing) return;

			prefilledDraftId.current = draftForEditing._id;
			setActiveDraftId(draftForEditing._id);
			setBrandId(draftForEditing.brandId);
			setContentType(draftForEditing.contentType);
			setTitle(draftForEditing.title);
			setContent(draftForEditing.content);
		}

		void prefillDraft();

		return () => {
			isCurrent = false;
		};
	}, [draftForEditing]);

	const readyBrands =
		brands?.filter(
			(brand) => normalizeBrandRagStatus(brand.ragStatus) === "ready",
		) ?? [];
	const activeBrandId = brandId || readyBrands[0]?._id || "";

	function loadDraft(draft: EditableAuditDraft) {
		setActiveDraftId(draft._id);
		setBrandId(draft.brandId);
		setContentType(draft.contentType);
		setTitle(draft.title);
		setContent(draft.content);
		setStatus("idle");
		setErrorMessage("");
	}

	async function saveDraft() {
		if (!activeBrandId || !title.trim() || !content.trim()) {
			toast.error("Action failed", {
				description: "Select a brand, add a title, and add content.",
			});
			return;
		}

		setDraftStatus("saving");

		try {
			if (activeDraftId) {
				await updateDraft({
					draftId: activeDraftId,
					brandId: activeBrandId,
					contentType,
					title,
					content,
				});
				toast.success("Draft updated");
			} else {
				const newDraftId = await createDraft({
					...workspaceArgs,
					brandId: activeBrandId,
					contentType,
					title,
					content,
				});
				setActiveDraftId(newDraftId);
				toast.success("Draft saved");
			}
		} catch (error) {
			toast.error("Action failed", {
				description: error instanceof Error ? error.message : "Please try again.",
			});
		} finally {
			setDraftStatus("idle");
		}
	}

	async function analyze() {
		if (!activeBrandId || !content.trim()) {
			setStatus("failed");
			setErrorMessage(
				"Select a ready brand and add text before running an audit.",
			);
			return;
		}

		setStatus("processing");
		setErrorMessage("");

		try {
			const result = activeDraftId
				? await runDraftAudit({ draftId: activeDraftId })
				: await createManualAudit({
						...workspaceArgs,
						brandId: activeBrandId,
						contentType,
						content,
					});
			if (activeDraftId) {
				toast.success("Audit started from draft");
			}
			router.push(`/reports/${result.reportId}`);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Audit processing failed.",
			);
			setStatus("failed");
		}
	}

	return (
		<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
			<Card className="rounded-lg">
				<CardHeader>
					<div className="flex flex-wrap items-center gap-2">
						<CardTitle>Audit setup</CardTitle>
						{activeDraftId ? (
							<Badge variant="secondary">Editing draft</Badge>
						) : null}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<label className="grid gap-2 text-sm font-medium">
						Title
						<Input
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							placeholder="Draft title"
						/>
					</label>
					<label className="grid gap-2 text-sm font-medium">
						Brand
						{brands === undefined ? (
							<div className="rounded-lg border px-2.5 py-2 text-sm text-muted-foreground">
								Loading brands...
							</div>
						) : brands.length ? (
							<BrandSelector
								brands={brands}
								value={activeBrandId}
								onValueChange={setBrandId}
								readyOnly
							/>
						) : (
							<div className="rounded-lg border border-dashed px-2.5 py-2 text-sm text-muted-foreground">
								Create a brand before running an audit.
							</div>
						)}
					</label>
					<label className="grid gap-2 text-sm font-medium">
						Content type
						<Select
							value={contentType}
							onValueChange={(value) => {
								if (value) setContentType(value as ContentType);
							}}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select content type" />
							</SelectTrigger>
							<SelectContent>
								{CONTENT_TYPES.map((type) => (
									<SelectItem
										key={type}
										value={type}
									>
										{CONTENT_TYPE_LABELS[type]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</label>
					<label className="grid gap-2 text-sm font-medium">
						Content to audit
						<Textarea
							value={content}
							onChange={(event) => setContent(event.target.value)}
							className="min-h-56 resize-y"
							placeholder="Paste the content you plan to publish."
						/>
					</label>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={saveDraft}
							disabled={draftStatus === "saving" || brands === undefined}
						>
							<Save data-icon="inline-start" />
							{draftStatus === "saving"
								? "Saving"
								: activeDraftId
									? "Update draft"
									: "Save draft"}
						</Button>
						<Button
							type="button"
							onClick={analyze}
							disabled={
								status === "processing" ||
								brands === undefined ||
								!readyBrands.length
							}
						>
							<Play data-icon="inline-start" />
							{status === "processing" ? "Starting audit" : "Analyze"}
						</Button>
					</div>
					<div className="space-y-4">
						{draftId && draftForEditing === undefined ? (
							<LoadingState label="Loading draft" />
						) : null}
						{draftId && draftForEditing === null ? (
							<Alert variant="destructive">
								<AlertCircle className="size-4" />
								<AlertTitle>Draft unavailable</AlertTitle>
								<AlertDescription>
									The draft could not be found. You can still start a new audit.
								</AlertDescription>
							</Alert>
						) : null}
						{sourceReportPrefill.status === "loading" ? (
							<LoadingState label="Loading source report" />
						) : null}
						{sourceReportPrefill.status === "failed" ? (
							<Alert variant="destructive">
								<AlertCircle className="size-4" />
								<AlertTitle>Re-audit prefill unavailable</AlertTitle>
								<AlertDescription>{sourceReportPrefill.message}</AlertDescription>
							</Alert>
						) : null}
						{brands !== undefined && brands.length > 0 && !readyBrands.length ? (
							<Alert>
								<AlertCircle className="size-4" />
								<AlertTitle>No ready brands</AlertTitle>
								<AlertDescription>
									Brand constitutions must finish RAG indexing before they can be
									used for audits.
								</AlertDescription>
							</Alert>
						) : null}
						{status === "failed" ? (
							<Alert variant="destructive">
								<AlertCircle className="size-4" />
								<AlertTitle>Audit could not start</AlertTitle>
								<AlertDescription>{errorMessage}</AlertDescription>
							</Alert>
						) : null}
						{status === "processing" ? (
							<LoadingState label="Creating report" />
						) : null}
					</div>
				</CardContent>
			</Card>

			<DraftsPanel
				workspaceId={workspaceId}
				activeDraftId={activeDraftId}
				onLoadDraft={loadDraft}
			/>
		</div>
	);
}
