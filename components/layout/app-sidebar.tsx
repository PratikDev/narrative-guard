"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import {
	BarChart3,
	Command,
	FileText,
	History,
	LogOut,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { APP_ROUTES } from "@/lib/routes";

const data = {
	navItems: [
		{
			name: "Dashboard",
			url: APP_ROUTES.dashboard,
			icon: BarChart3,
		},
		{
			name: "Setup",
			url: APP_ROUTES.setup,
			icon: ShieldCheck,
		},
		{
			name: "Audit",
			url: APP_ROUTES.audit,
			icon: FileText,
		},
		{
			name: "History",
			url: APP_ROUTES.history,
			icon: History,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const user = useQuery(api.viewer.currentUser);

	return (
		<Sidebar
			variant="inset"
			collapsible="icon"
			{...props}
		>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							asChild
						>
							<Link
								href={APP_ROUTES.dashboard}
								className="flex items-center gap-2"
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Command className="size-4" />
								</div>

								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">Acme Inc</span>
									<span className="truncate text-xs">Enterprise</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<NavItems projects={data.navItems} />
			</SidebarContent>

			<SidebarFooter>
				<NavUser
					user={{
						name: user?.name ?? "Signed in",
						email: user?.email ?? "",
						avatar: user?.image ?? "",
					}}
				/>
			</SidebarFooter>
		</Sidebar>
	);
}

function NavUser({
	user,
}: {
	user: { name: string; email: string; avatar: string };
}) {
	const { signOut } = useAuthActions();
	const fallback = user.name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<Avatar className="size-8 rounded-lg">
						<AvatarImage
							src={user.avatar}
							alt={user.name}
						/>
						<AvatarFallback className="rounded-lg">
							{fallback || "U"}
						</AvatarFallback>
					</Avatar>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-medium">{user.name}</span>
						<span className="truncate text-xs">{user.email}</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
			<SidebarMenuItem>
				<SidebarMenuButton
					type="button"
					onClick={() => void signOut()}
				>
					<LogOut />
					<span>Sign out</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

function NavItems({ projects }: { projects: typeof data.navItems }) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Paths</SidebarGroupLabel>

			<SidebarMenu>
				{projects.map((item, idx) => (
					<SidebarMenuItem key={item.name + idx}>
						<SidebarMenuButton asChild>
							<Link
								href={item.url}
								className="flex items-center gap-2"
							>
								<item.icon />
								<span>{item.name}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
