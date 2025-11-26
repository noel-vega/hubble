import { Box, Package, LogOut } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { postLogout } from "@/features/auth/api/postLogout";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";

const menuItems = [
	{
		title: "Containers",
		url: "/containers",
		icon: Box,
	},
	{
		title: "Registry",
		url: "/registry",
		icon: Package,
	},
];

export function AppSidebar() {
	const navigate = useNavigate();

	const logout = useMutation({
		mutationFn: postLogout,
		onSuccess: () => {
			navigate({ to: "/login" });
		},
	});

	return (
		<Sidebar className="border-r border-slate-200 dark:border-slate-800">
			<SidebarHeader className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
				<div className="flex items-center gap-3 px-4 py-4">
					<span className="text-2xl">🔭</span>
					<div>
						<h1 className="text-lg font-semibold text-slate-900 dark:text-white">
							Hubble
						</h1>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent className="bg-white dark:bg-slate-950">
				<SidebarGroup>
					<SidebarGroupLabel className="text-slate-500 dark:text-slate-400">
						Navigation
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link
											to={item.url}
											className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 data-[active]:bg-slate-100 dark:data-[active]:bg-slate-900"
										>
											<item.icon className="w-4 h-4" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
				<div className="p-4 space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-sm text-slate-600 dark:text-slate-400">
							Theme
						</span>
						<ModeToggle />
					</div>
					<button
						onClick={() => logout.mutate()}
						disabled={logout.isPending}
						className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md transition-colors"
					>
						<LogOut className="w-4 h-4" />
						<span>{logout.isPending ? "Logging out..." : "Logout"}</span>
					</button>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
