"use client";

import { Check, ChevronsUpDown, GalleryVerticalEnd, Plus } from "lucide-react";
import { useState } from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import CreateNewWorkspaceForm from "./CreateNewWorkspaceForm";

export function WorkspaceSwitcher() {
	const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
	const {
		activeWorkspace,
		isLoading,
		selectWorkspace,
		workspaces,
		workspaceId,
	} = useWorkspace();
	const selectedWorkspaceName = activeWorkspace?.name ?? "Loading...";

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuButton
						size="lg"
						className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
							<GalleryVerticalEnd className="size-4" />
						</div>

						<div className="flex flex-col gap-0.5 leading-none">
							<span className="font-medium">Workspace</span>
							<span className="truncate text-xs">{selectedWorkspaceName}</span>
						</div>

						<ChevronsUpDown className="ml-auto" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					className="w-(--radix-dropdown-menu-trigger-width)"
					align="start"
				>
					{isLoading ? (
						<DropdownMenuItem disabled>Loading workspaces...</DropdownMenuItem>
					) : null}

					{workspaces.map(({ workspace }) => (
						<DropdownMenuItem
							key={workspace._id}
							onSelect={() => selectWorkspace(workspace._id)}
						>
							<span className="truncate">{workspace.name}</span>
							{workspace._id === workspaceId ? (
								<Check className="ml-auto" />
							) : null}
						</DropdownMenuItem>
					))}

					{!isLoading && !workspaces.length ? (
						<DropdownMenuItem disabled>No workspaces found</DropdownMenuItem>
					) : null}

					<DropdownMenuItem
						className="mt-2"
						onSelect={() => setIsCreateWorkspaceOpen(true)}
					>
						<Plus />
						Create New Workspace
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{!isLoading ? (
				<CreateNewWorkspaceForm
					open={isCreateWorkspaceOpen}
					onOpenChange={setIsCreateWorkspaceOpen}
				/>
			) : null}
		</>
	);
}
