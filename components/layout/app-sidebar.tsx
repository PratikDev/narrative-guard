"use client";

import {
	BarChart3,
	Command,
	FileText,
	History,
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

const data = {
	user: {
		name: "John Doe",
		email: "john@doe.com",
		avatar: "/avatars/jd.jpg",
	},
	navItems: [
		{
			name: "Dashboard",
			url: "/",
			icon: BarChart3,
		},
		{
			name: "Setup",
			url: "/setup",
			icon: ShieldCheck,
		},
		{
			name: "Audit",
			url: "/audit",
			icon: FileText,
		},
		{
			name: "History",
			url: "/history",
			icon: History,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar
			variant="inset"
			{...props}
		>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							render={
								<Link
									href="/"
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
							}
						></SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<NavItems projects={data.navItems} />
			</SidebarContent>

			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}

function NavUser({ user }: { user: typeof data.user }) {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<Avatar className="h-8 w-8 rounded-lg">
						<AvatarImage
							src={user.avatar}
							alt={user.name}
						/>
						<AvatarFallback className="rounded-lg">JD</AvatarFallback>
					</Avatar>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-medium">{user.name}</span>
						<span className="truncate text-xs">{user.email}</span>
					</div>
					{/* <ChevronsUpDown className="ml-auto size-4" /> */}
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
						<SidebarMenuButton
							render={
								<Link
									href={item.url}
									className="flex items-center gap-2"
								>
									<item.icon />
									<span>{item.name}</span>
								</Link>
							}
						></SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
