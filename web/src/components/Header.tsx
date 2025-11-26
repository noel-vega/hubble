import { Box, Package, LogOut, Menu } from "lucide-react";
import { Link, useRouterState, useParams } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { postLogout } from "@/features/auth/api/postLogout";
import { useNavigate } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

const navItems = [
	{
		title: "Projects",
		url: "/projects",
		icon: Package,
	},
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

interface HeaderProps {
	username?: string;
}

export function Header({ username }: HeaderProps) {
	const navigate = useNavigate();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// Check if we're on a project page
	const params = useParams({ strict: false }) as { name?: string };
	const isProjectPage = currentPath.startsWith("/projects/") && params.name;
	const projectName = params.name;

	const logout = useMutation({
		mutationFn: postLogout,
		onSuccess: () => {
			navigate({ to: "/login" });
		},
	});

	// Project navigation items
	const projectNavItems = projectName
		? [
				{
					title: "Services",
					url: `/projects/${projectName}/services`,
				},
				{
					title: "Compose",
					url: `/projects/${projectName}`,
				},
				{
					title: "Containers",
					url: `/projects/${projectName}/containers`,
				},
				{
					title: "Networks",
					url: `/projects/${projectName}/networks`,
				},
				{
					title: "Volumes",
					url: `/projects/${projectName}/volumes`,
				},
				{
					title: "Environment",
					url: `/projects/${projectName}/env`,
				},
			]
		: [];

	return (
		<>
			<header className="sticky top-0 z-50 w-full bg-[#0d1117] border-b border-slate-700">
				{/* Row 1 - Logo, breadcrumbs, and actions */}
				<div className="flex items-center h-12 px-4 gap-4 pt-2">
					{/* Left side - Sidebar toggle, Logo, and Breadcrumbs */}
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setSidebarOpen(true)}
							className="text-slate-300 hover:text-white hover:bg-slate-800"
						>
							<Menu className="w-5 h-5" />
						</Button>
						<Link
							to="/projects"
							className="flex items-center gap-2 text-white hover:text-slate-300 transition-colors"
						>
							<span className="text-2xl">🔭</span>
							<span className="text-lg font-bold">Hubble</span>
						</Link>
						{isProjectPage && (
							<>
								<span className="text-slate-600">/</span>
								<Link
									to="/projects"
									className="text-slate-400 hover:text-white transition-colors text-sm"
								>
									projects
								</Link>
								<span className="text-slate-600">/</span>
								<span className="text-white font-medium text-sm">
									{projectName}
								</span>
							</>
						)}
					</div>

					{/* Spacer */}
					<div className="flex-1" />

					{/* Right side items */}
					<div className="flex items-center gap-3">
						{username && (
							<span className="text-sm text-slate-400 hidden sm:block">
								{username}
							</span>
						)}
						<div className="[&_button]:text-slate-300 [&_button:hover]:text-white [&_button:hover]:bg-slate-800">
							<ModeToggle />
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => logout.mutate()}
							disabled={logout.isPending}
							className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
						>
							<LogOut className="w-4 h-4" />
							<span className="hidden sm:inline">
								{logout.isPending ? "Logging out..." : "Logout"}
							</span>
						</Button>
					</div>
				</div>

				{/* Row 2 - Navigation tabs */}
				<div className="flex items-center h-10 px-6">
					<nav className="flex -mb-px">
						{isProjectPage
							? // Show project-specific navigation
								projectNavItems.map((item) => {
									const isActive =
										currentPath === item.url ||
										(item.url.includes("/services") &&
											currentPath.includes("/services"));
									return (
										<Link
											key={item.url}
											to={item.url}
											className={`
                        flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                        ${
													isActive
														? "border-orange-500 text-white"
														: "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
												}
                      `}
										>
											<span>{item.title}</span>
										</Link>
									);
								})
							: // Show default navigation
								navItems.map((item) => {
									const isActive = currentPath.startsWith(item.url);
									return (
										<Link
											key={item.url}
											to={item.url}
											className={`
                        flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                        ${
													isActive
														? "border-orange-500 text-white"
														: "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
												}
                      `}
										>
											<item.icon className="w-4 h-4" />
											<span>{item.title}</span>
										</Link>
									);
								})}
					</nav>
				</div>
			</header>

			{/* Sidebar Sheet */}
			<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
				<SheetContent
					side="left"
					className="w-[300px] sm:w-[400px] bg-white dark:bg-slate-950"
				>
					<SheetHeader>
						<SheetTitle className="flex items-center gap-2">
							<span className="text-xl">🔭</span>
							<span>Hubble Navigation</span>
						</SheetTitle>
					</SheetHeader>
					<div className="mt-6">
						<p className="text-sm text-slate-500 dark:text-slate-400">
							Higher-level navigation links will appear here in the future.
						</p>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
