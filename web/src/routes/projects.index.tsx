import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import {
	useSuspenseQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	getProjects,
	type ProjectInfo,
	type ProjectsResponse,
} from "@/features/projects/api/get-projects";
import { postCreateProject } from "@/features/projects/api/post-create-project";
import { fetchMe } from "@/features/auth/api/fetchMe";
import {
	Search,
	FolderGit2,
	Server,
	Play,
	Square,
	Layers,
	Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/projects/")({
	beforeLoad: async ({ context }) => {
		try {
			const auth = await context.queryClient.ensureQueryData({
				queryKey: ["auth", "me"],
				queryFn: fetchMe,
			});

			if (!auth.authenticated) {
				throw redirect({ to: "/login" });
			}

			const queryOptions = {
				queryKey: ["projects"],
				queryFn: getProjects,
			};
			await context.queryClient.ensureQueryData(queryOptions);
			return { auth, queryOptions };
		} catch (error) {
			// If auth check fails or any error occurs, redirect to login
			throw redirect({ to: "/login" });
		}
	},
	component: RouteComponent,
});

function ProjectCard({ project }: { project: ProjectInfo }) {
	const hasRunningContainers = project.containers_running > 0;
	const totalContainers =
		project.containers_running + project.containers_stopped;

	return (
		<Link
			to="/projects/$name/services"
			params={{ name: project.name }}
			className="group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-950/50 transition-all duration-200 block"
		>
			<div className="p-6">
				{/* Header */}
				<div className="flex items-start justify-between mb-5">
					<div className="flex items-start gap-3 flex-1 min-w-0">
						<div className="p-2.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
							<FolderGit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
								{project.name}
							</h3>
							<p className="text-sm text-slate-500 dark:text-slate-400 truncate font-mono">
								{project.path}
							</p>
						</div>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-3 gap-4 mb-5">
					{/* Services */}
					<div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
						<div className="flex items-center gap-2 mb-1">
							<Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
							<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
								Services
							</p>
						</div>
						<p className="text-xl font-bold text-slate-900 dark:text-white">
							{project.service_count}
						</p>
					</div>

					{/* Running */}
					<div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
						<div className="flex items-center gap-2 mb-1">
							<Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
							<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
								Running
							</p>
						</div>
						<p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
							{project.containers_running}
						</p>
					</div>

					{/* Stopped */}
					<div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
						<div className="flex items-center gap-2 mb-1">
							<Square className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
							<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
								Stopped
							</p>
						</div>
						<p className="text-xl font-bold text-red-600 dark:text-red-400">
							{project.containers_stopped}
						</p>
					</div>
				</div>

				{/* Status Bar */}
				<div className="pt-4 border-t border-slate-100 dark:border-slate-800">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Server className="w-4 h-4 text-slate-400" />
							<span className="text-sm text-slate-600 dark:text-slate-400">
								{totalContainers}{" "}
								{totalContainers === 1 ? "container" : "containers"}
							</span>
						</div>
						<div
							className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
								hasRunningContainers
									? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
									: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20"
							}`}
						>
							<span
								className={`w-1.5 h-1.5 rounded-full ${
									hasRunningContainers ? "bg-emerald-500" : "bg-slate-400"
								}`}
							/>
							{hasRunningContainers ? "Active" : "Inactive"}
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}

function CreateProjectDialog() {
	const [open, setOpen] = useState(false);
	const [projectName, setProjectName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const queryClient = useQueryClient();

	const createProjectMutation = useMutation({
		mutationFn: postCreateProject,
		onSuccess: () => {
			setOpen(false);
			setProjectName("");
			setError(null);
			// Invalidate and refetch projects
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
		onError: (error: Error) => {
			setError(error.message || "Failed to create project");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!projectName.trim()) {
			setError("Project name is required");
			return;
		}
		setError(null);
		createProjectMutation.mutate({ name: projectName.trim() });
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="bg-blue-600 hover:bg-blue-700 text-white">
					<Plus className="w-4 h-4" />
					New Project
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Create New Project</DialogTitle>
						<DialogDescription>
							Enter a name for your new Docker Compose project.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Project Name</Label>
							<Input
								id="name"
								value={projectName}
								onChange={(e) => setProjectName(e.target.value)}
								placeholder="my-project"
								className="col-span-3"
								disabled={createProjectMutation.isPending}
							/>
							{error && (
								<p className="text-sm text-red-600 dark:text-red-400">
									{error}
								</p>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={createProjectMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={createProjectMutation.isPending}
							className="bg-blue-600 hover:bg-blue-700 text-white"
						>
							{createProjectMutation.isPending
								? "Creating..."
								: "Create Project"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function RouteComponent() {
	const { queryOptions } = Route.useRouteContext();
	const query = useSuspenseQuery(queryOptions);
	const [searchQuery, setSearchQuery] = useState("");

	const data = query.data as ProjectsResponse;

	const filteredProjects = useMemo(() => {
		if (!searchQuery.trim()) {
			return data.projects;
		}
		return data.projects.filter(
			(project) =>
				project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.path.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [data.projects, searchQuery]);

	const stats = useMemo(() => {
		return {
			total: data.count,
			running: data.projects.reduce((sum, p) => sum + p.containers_running, 0),
			stopped: data.projects.reduce((sum, p) => sum + p.containers_stopped, 0),
			services: data.projects.reduce((sum, p) => sum + p.service_count, 0),
		};
	}, [data]);

	return (
		<div className="bg-slate-50 dark:bg-[#0d1117] min-h-screen">
			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-blue-500/10">
								<FolderGit2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
							</div>
							<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
								Projects
							</h1>
						</div>
						<CreateProjectDialog />
					</div>
					<p className="text-slate-600 dark:text-slate-400">
						Manage your Docker Compose projects
					</p>
				</div>

				{/* Search Bar and Stats */}
				<div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
					<div className="relative w-full sm:w-auto sm:min-w-[300px]">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
						<Input
							type="text"
							placeholder="Search projects..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
						/>
					</div>

					<div className="flex items-center gap-4 text-sm">
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-blue-500" />
							<span className="text-slate-600 dark:text-slate-400">
								{stats.total} {stats.total === 1 ? "project" : "projects"}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-emerald-500" />
							<span className="text-slate-600 dark:text-slate-400">
								{stats.running} running
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-red-500" />
							<span className="text-slate-600 dark:text-slate-400">
								{stats.stopped} stopped
							</span>
						</div>
					</div>
				</div>

				{/* Projects Grid */}
				{filteredProjects.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
						{filteredProjects.map((project) => (
							<ProjectCard key={project.name} project={project} />
						))}
					</div>
				) : (
					<div className="text-center py-16">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
							<FolderGit2 className="w-8 h-8 text-slate-400" />
						</div>
						<p className="text-slate-500 dark:text-slate-400 mb-1">
							{searchQuery
								? "No projects found matching your search"
								: "No projects found"}
						</p>
						<p className="text-sm text-slate-400 dark:text-slate-500">
							{!searchQuery &&
								"Create a docker-compose.yml file to get started"}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
