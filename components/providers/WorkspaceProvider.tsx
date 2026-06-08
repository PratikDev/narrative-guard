"use client";

import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

const SELECTED_WORKSPACE_STORAGE_KEY = "narrative-guard:selected-workspace-id";

type WorkspaceListItem = {
	workspace: Doc<"workspaces">;
	membership: Doc<"workspaceMembers">;
};

type WorkspaceContextValue = {
	activeMembership: Doc<"workspaceMembers"> | null;
	activeWorkspace: Doc<"workspaces"> | null;
	isLoading: boolean;
	selectWorkspace: (workspaceId: Id<"workspaces">) => void;
	workspaces: WorkspaceListItem[];
	workspaceId: Id<"workspaces"> | undefined;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
	const workspaces = useQuery(api.workspace.listWorkspaces);
	const getOrCreateDefaultWorkspace = useMutation(
		api.workspace.getOrCreateDefaultWorkspace,
	);
	const syncPendingInviteNotifications = useMutation(
		api.workspace.syncPendingInviteNotifications,
	);
	const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<
		Id<"workspaces"> | undefined
	>(() => {
		if (typeof window === "undefined") return undefined;

		return (
			(window.localStorage.getItem(
				SELECTED_WORKSPACE_STORAGE_KEY,
			) as Id<"workspaces"> | null) ?? undefined
		);
	});
	const isCreatingDefaultWorkspace = useRef(false);
	const didSyncPendingInviteNotifications = useRef(false);

	useEffect(() => {
		if (workspaces === undefined || workspaces.length) return;
		if (isCreatingDefaultWorkspace.current) return;

		isCreatingDefaultWorkspace.current = true;
		getOrCreateDefaultWorkspace()
			.then((result) => {
				setSelectedWorkspaceId(result.workspace._id);
				window.localStorage.setItem(
					SELECTED_WORKSPACE_STORAGE_KEY,
					result.workspace._id,
				);
			})
			.finally(() => {
				isCreatingDefaultWorkspace.current = false;
			});
	}, [getOrCreateDefaultWorkspace, workspaces]);

	useEffect(() => {
		if (workspaces === undefined || didSyncPendingInviteNotifications.current) {
			return;
		}

		didSyncPendingInviteNotifications.current = true;
		void syncPendingInviteNotifications();
	}, [syncPendingInviteNotifications, workspaces]);

	const selectWorkspace = useCallback((workspaceId: Id<"workspaces">) => {
		setSelectedWorkspaceId(workspaceId);
		window.localStorage.setItem(SELECTED_WORKSPACE_STORAGE_KEY, workspaceId);
	}, []);

	const activeItem = useMemo(
		() => {
			if (!workspaces?.length) return null;

			return (
				workspaces.find((item) => item.workspace._id === selectedWorkspaceId) ??
				workspaces[0] ??
				null
			);
		},
		[selectedWorkspaceId, workspaces],
	);

	const value = useMemo<WorkspaceContextValue>(
		() => ({
			activeMembership: activeItem?.membership ?? null,
			activeWorkspace: activeItem?.workspace ?? null,
			isLoading: workspaces === undefined,
			selectWorkspace,
			workspaces: workspaces ?? [],
			workspaceId: activeItem?.workspace._id,
		}),
		[activeItem, selectWorkspace, workspaces],
	);

	return (
		<WorkspaceContext.Provider value={value}>
			{children}
		</WorkspaceContext.Provider>
	);
}

export function useWorkspace() {
	const context = useContext(WorkspaceContext);

	if (!context) {
		throw new Error("useWorkspace must be used within WorkspaceProvider.");
	}

	return context;
}
