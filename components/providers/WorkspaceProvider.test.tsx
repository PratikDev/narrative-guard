// @vitest-environment jsdom
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useWorkspace, WorkspaceProvider } from "./WorkspaceProvider";

const STORAGE_KEY = "narrative-guard:selected-workspace-id";

const mocks = vi.hoisted(() => ({
	listWorkspacesRef: Symbol("listWorkspaces"),
	getOrCreateRef: Symbol("getOrCreateDefaultWorkspace"),
	syncRef: Symbol("syncPendingInviteNotifications"),
	workspaces: undefined as unknown,
	getOrCreateDefaultWorkspace: vi.fn(),
	syncPendingInviteNotifications: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		workspace: {
			listWorkspaces: mocks.listWorkspacesRef,
			getOrCreateDefaultWorkspace: mocks.getOrCreateRef,
			syncPendingInviteNotifications: mocks.syncRef,
		},
	},
}));

vi.mock("convex/react", () => ({
	useQuery: () => mocks.workspaces,
	useMutation: (ref: unknown) => {
		if (ref === mocks.getOrCreateRef) return mocks.getOrCreateDefaultWorkspace;
		if (ref === mocks.syncRef) return mocks.syncPendingInviteNotifications;
		return vi.fn();
	},
}));

function workspaceItem(id: string, name: string) {
	return {
		workspace: { _id: id, name } as Doc<"workspaces">,
		membership: { role: "owner" } as Doc<"workspaceMembers">,
	};
}

function Probe() {
	const workspace = useWorkspace();
	return (
		<div>
			<span data-testid="loading">{String(workspace.isLoading)}</span>
			<span data-testid="workspace-id">{workspace.workspaceId ?? "none"}</span>
			<span data-testid="workspace-count">{workspace.workspaces.length}</span>
			<button
				type="button"
				onClick={() => workspace.selectWorkspace("ws_2" as Id<"workspaces">)}
			>
				select second
			</button>
		</div>
	);
}

beforeEach(() => {
	window.localStorage.clear();
	mocks.workspaces = undefined;
	mocks.getOrCreateDefaultWorkspace.mockReset();
	mocks.getOrCreateDefaultWorkspace.mockResolvedValue({
		workspace: { _id: "ws_default", name: "Default" },
		membership: { role: "owner" },
	});
	mocks.syncPendingInviteNotifications.mockReset();
	mocks.syncPendingInviteNotifications.mockResolvedValue({ created: 0 });
});

describe("useWorkspace", () => {
	it("throws when used outside a WorkspaceProvider", () => {
		expect(() => renderHook(() => useWorkspace())).toThrow(
			"useWorkspace must be used within WorkspaceProvider.",
		);
	});
});

describe("WorkspaceProvider", () => {
	it("is loading while the workspace list query is still pending", () => {
		mocks.workspaces = undefined;

		render(
			<WorkspaceProvider>
				<Probe />
			</WorkspaceProvider>,
		);

		expect(screen.getByTestId("loading")).toHaveTextContent("true");
	});

	it("selects the workspace saved in localStorage", () => {
		window.localStorage.setItem(STORAGE_KEY, "ws_1");
		mocks.workspaces = [workspaceItem("ws_1", "First"), workspaceItem("ws_2", "Second")];

		render(
			<WorkspaceProvider>
				<Probe />
			</WorkspaceProvider>,
		);

		expect(screen.getByTestId("workspace-id")).toHaveTextContent("ws_1");
		expect(screen.getByTestId("loading")).toHaveTextContent("false");
	});

	it("falls back to the first workspace when the stored id is not in the list", () => {
		window.localStorage.setItem(STORAGE_KEY, "ws_missing");
		mocks.workspaces = [workspaceItem("ws_1", "First"), workspaceItem("ws_2", "Second")];

		render(
			<WorkspaceProvider>
				<Probe />
			</WorkspaceProvider>,
		);

		expect(screen.getByTestId("workspace-id")).toHaveTextContent("ws_1");
	});

	it("persists selectWorkspace to state and localStorage", async () => {
		mocks.workspaces = [workspaceItem("ws_1", "First"), workspaceItem("ws_2", "Second")];
		const user = userEvent.setup();

		render(
			<WorkspaceProvider>
				<Probe />
			</WorkspaceProvider>,
		);
		expect(screen.getByTestId("workspace-id")).toHaveTextContent("ws_1");

		await user.click(screen.getByRole("button", { name: "select second" }));

		expect(screen.getByTestId("workspace-id")).toHaveTextContent("ws_2");
		expect(window.localStorage.getItem(STORAGE_KEY)).toBe("ws_2");
	});

	it("creates a default workspace when the user has none", async () => {
		mocks.workspaces = [];

		render(
			<WorkspaceProvider>
				<Probe />
			</WorkspaceProvider>,
		);

		await waitFor(() => {
			expect(mocks.getOrCreateDefaultWorkspace).toHaveBeenCalledTimes(1);
		});
	});

	it("does not create a default workspace while still loading or once populated", async () => {
		mocks.workspaces = [workspaceItem("ws_1", "First")];

		render(
			<WorkspaceProvider>
				<Probe />
			</WorkspaceProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("workspace-count")).toHaveTextContent("1");
		});
		expect(mocks.getOrCreateDefaultWorkspace).not.toHaveBeenCalled();
	});
});
