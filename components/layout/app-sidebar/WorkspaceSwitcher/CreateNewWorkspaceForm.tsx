"use client";

import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { useMutation } from "convex/react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const WORKSPACE_NAME_MAX_LENGTH = 80;

type CreateNewWorkspaceFormProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function CreateNewWorkspaceForm({
	open,
	onOpenChange,
}: CreateNewWorkspaceFormProps) {
	const createWorkspace = useMutation(api.workspace.createWorkspace);
	const { selectWorkspace } = useWorkspace();
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	function handleOpenChange(nextOpen: boolean) {
		onOpenChange(nextOpen);

		if (!nextOpen) {
			setName("");
			setError("");
			setIsSubmitting(false);
		}
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const normalizedName = name.trim();

		if (!normalizedName) {
			setError("Workspace name is required.");
			return;
		}

		setError("");
		setIsSubmitting(true);

		try {
			const result = await createWorkspace({ name: normalizedName });
			selectWorkspace(result.workspaceId);
			handleOpenChange(false);
		} catch (submissionError) {
			setError(
				submissionError instanceof Error
					? submissionError.message
					: "Could not create workspace.",
			);
			setIsSubmitting(false);
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogContent className="sm:max-w-sm">
				<form
					className="flex flex-col gap-4"
					onSubmit={handleSubmit}
				>
					<DialogHeader>
						<DialogTitle>Create New Workspace</DialogTitle>
						<DialogDescription>
							Add a workspace for a separate team, client, or brand portfolio.
						</DialogDescription>
					</DialogHeader>

					<FieldGroup>
						<Field data-invalid={Boolean(error)}>
							<FieldLabel htmlFor="workspace-name">Name</FieldLabel>
							<Input
								id="workspace-name"
								name="name"
								placeholder="Example Workspace"
								value={name}
								maxLength={WORKSPACE_NAME_MAX_LENGTH}
								aria-invalid={Boolean(error)}
								disabled={isSubmitting}
								onChange={(event) => {
									setName(event.target.value);
									if (error) setError("");
								}}
							/>
							<FieldDescription>
								You will be added as the workspace owner.
							</FieldDescription>
							<FieldError>{error}</FieldError>
						</Field>
					</FieldGroup>

					<DialogFooter>
						<DialogClose asChild>
							<Button
								type="button"
								variant="outline"
								disabled={isSubmitting}
							>
								Cancel
							</Button>
						</DialogClose>
						<Button
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Creating..." : "Create workspace"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
