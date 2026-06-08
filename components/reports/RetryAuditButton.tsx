"use client";

import { useMutation } from "convex/react";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type RetryAuditButtonProps = {
	reportId: Id<"auditReports">;
	showLabel?: boolean;
};

export function RetryAuditButton({
	reportId,
	showLabel = false,
}: RetryAuditButtonProps) {
	const router = useRouter();
	const { workspaceId } = useWorkspace();
	const retryFailedAudit = useMutation(api.audit.retryFailedAudit);
	const [isRetrying, setIsRetrying] = useState(false);

	async function handleRetry() {
		setIsRetrying(true);

		try {
			const result = await retryFailedAudit({
				reportId,
				...(workspaceId ? { workspaceId } : {}),
			});
			toast.success("Audit retry started");
			router.push(`/reports/${result.reportId}`);
		} catch (error) {
			toast.error("Could not retry audit", {
				description:
					error instanceof Error ? error.message : "Please try again.",
			});
		} finally {
			setIsRetrying(false);
		}
	}

	return (
		<Button
			type="button"
			variant="outline"
			size={showLabel ? "default" : "icon-sm"}
			disabled={isRetrying}
			aria-label="Retry audit"
			onClick={handleRetry}
		>
			<RotateCcw data-icon="inline-start" />
			{showLabel ? (isRetrying ? "Retrying..." : "Retry audit") : null}
		</Button>
	);
}
