"use client";

import { useMutation } from "convex/react";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type InviteResponseButtonsProps = {
	inviteId: Id<"workspaceInvites">;
	onAccepted?: () => void;
	onDeclined?: () => void;
	size?: "sm" | "default";
};

export function InviteResponseButtons({
	inviteId,
	onAccepted,
	onDeclined,
	size = "sm",
}: InviteResponseButtonsProps) {
	const acceptInviteById = useMutation(api.workspace.acceptInviteById);
	const declineInviteById = useMutation(api.workspace.declineInviteById);
	const [processingAction, setProcessingAction] = useState<
		"accept" | "decline" | null
	>(null);
	const isProcessing = processingAction !== null;

	async function handleAccept() {
		setProcessingAction("accept");

		try {
			await acceptInviteById({ inviteId });
			toast.success("Invitation accepted", {
				description: "You can now access the workspace.",
			});
			onAccepted?.();
		} catch (error) {
			toast.error("Could not accept invitation", {
				description:
					error instanceof Error ? error.message : "Please try again.",
			});
		} finally {
			setProcessingAction(null);
		}
	}

	async function handleDecline() {
		setProcessingAction("decline");

		try {
			await declineInviteById({ inviteId });
			toast.success("Invitation declined");
			onDeclined?.();
		} catch (error) {
			toast.error("Could not decline invitation", {
				description:
					error instanceof Error ? error.message : "Please try again.",
			});
		} finally {
			setProcessingAction(null);
		}
	}

	return (
		<div className="flex flex-wrap gap-2">
			<Button
				type="button"
				size={size}
				disabled={isProcessing}
				onClick={handleAccept}
			>
				<Check data-icon="inline-start" />
				{processingAction === "accept" ? "Accepting..." : "Accept"}
			</Button>
			<Button
				type="button"
				variant="outline"
				size={size}
				disabled={isProcessing}
				onClick={handleDecline}
			>
				<X data-icon="inline-start" />
				{processingAction === "decline" ? "Rejecting..." : "Reject"}
			</Button>
		</div>
	);
}
