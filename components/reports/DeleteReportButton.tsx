"use client";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteReportButtonProps = {
	reportId: Id<"auditReports">;
	redirectTo?: string;
	showLabel?: boolean;
};

export function DeleteReportButton({
	reportId,
	redirectTo,
	showLabel = false,
}: DeleteReportButtonProps) {
	const router = useRouter();
	const deleteReport = useMutation(api.report.deleteReport);
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState("");

	async function handleDelete() {
		setError("");
		setIsDeleting(true);

		try {
			await deleteReport({ reportId });
			setOpen(false);

			if (redirectTo) {
				router.push(redirectTo);
			}
		} catch (deleteError) {
			setError(
				deleteError instanceof Error
					? deleteError.message
					: "Could not delete this report.",
			);
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={setOpen}
		>
			<AlertDialogTrigger asChild>
				<Button
					type="button"
					variant="destructive"
					size={showLabel ? "default" : "icon-sm"}
					aria-label="Delete report"
				>
					<Trash2 data-icon="inline-start" />
					{showLabel ? "Delete report" : null}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete this report?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete the audit report and its findings. The
						brand, brand constitution, and other reports will not be deleted.
					</AlertDialogDescription>
				</AlertDialogHeader>
				{error ? <p className="text-sm text-destructive">{error}</p> : null}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
					<Button
						type="button"
						variant="destructive"
						disabled={isDeleting}
						onClick={handleDelete}
					>
						{isDeleting ? "Deleting..." : "Delete report"}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
