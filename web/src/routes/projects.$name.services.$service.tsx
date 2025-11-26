import {
	createFileRoute,
	Link,
	getRouteApi,
	Outlet,
} from "@tanstack/react-router";
import {
	useSuspenseQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { ProjectComposeService } from "@/features/projects/types";
import { postServiceStart } from "@/features/projects/api/post-service-start";
import { postServiceStop } from "@/features/projects/api/post-service-stop";
import {
	ArrowLeft,
	Package,
	Network,
	HardDrive,
	Settings,
	PlayCircle,
	Layers,
	Terminal,
	Edit2,
	X,
	Loader2,
	Tag,
} from "lucide-react";
import z from "zod";
import { Button } from "@/components/ui/button";

const parentRoute = getRouteApi("/projects/$name/services");

export const Route = createFileRoute("/projects/$name/services/$service")({
	component: RouteComponent,
});

function RouteComponent() {
	const { name, service: serviceName } = Route.useParams();
	const { queryOptions } = parentRoute.useLoaderData();
	const { data } = useSuspenseQuery(queryOptions);
	const queryClient = useQueryClient();

	const services = (
		data as { services: z.infer<typeof ProjectComposeService>[] }
	).services;

	const service = services.find((s) => s.name === serviceName);

	const startService = useMutation({
		mutationFn: postServiceStart,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
		},
	});

	const stopService = useMutation({
		mutationFn: postServiceStop,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
		},
	});

	if (!service) {
		return (
			<div className="text-center py-12">
				<p className="text-slate-500 dark:text-slate-400">Service not found</p>
				<Link
					to="/projects/$name/services"
					params={{ name }}
					className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block"
				>
					Back to services
				</Link>
			</div>
		);
	}

	return (
		<>
			<Outlet />
			<div>
				{/* Back Button */}
				<Link
					to="/projects/$name/services"
					params={{ name }}
					className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors group"
				>
					<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
					Back to services
				</Link>

				{/* Service Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-3">
							<div className="p-2.5 rounded-lg bg-purple-500/10">
								<Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
									{service.name}
								</h1>
								<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
									Docker Compose service configuration
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Link
								to="/projects/$name/services/$service/edit"
								params={{ name, service: service.name }}
							>
								<Button
									variant="outline"
									size="default"
									className="gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border-slate-300 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
								>
									<Edit2 className="w-4 h-4" />
									<span>Edit</span>
								</Button>
							</Link>
							{service.status !== "running" && (
								<Button
									variant="outline"
									size="default"
									onClick={() =>
										startService.mutate({
											projectName: name,
											serviceName: service.name,
										})
									}
									disabled={startService.isPending}
									className="gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 border-slate-300 dark:border-slate-700 hover:bg-green-50 dark:hover:bg-green-950/20"
								>
									{startService.isPending ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<PlayCircle className="w-4 h-4" />
									)}
									<span>
										{startService.isPending ? "Starting..." : "Start"}
									</span>
								</Button>
							)}
							{service.status === "running" && (
								<Button
									variant="outline"
									size="default"
									onClick={() =>
										stopService.mutate({
											projectName: name,
											serviceName: service.name,
										})
									}
									disabled={stopService.isPending}
									className="gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-slate-300 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/20"
								>
									{stopService.isPending ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<X className="w-4 h-4" />
									)}
									<span>{stopService.isPending ? "Stopping..." : "Stop"}</span>
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* Content Grid */}
				<div className="space-y-4">
					{/* Image & Build */}
					{(service.image || service.build) && (
						<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
							<div className="flex items-center gap-2 mb-4">
								<Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									IMAGE & BUILD
								</h2>
							</div>

							<div className="space-y-2">
								{service.image && (
									<div>
										<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
											Image
										</p>
										<p className="font-mono text-sm text-slate-900 dark:text-white">
											{service.image}
										</p>
									</div>
								)}
								{service.build && (
									<div>
										<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
											Build Context
										</p>
										<p className="font-mono text-sm text-slate-900 dark:text-white">
											{service.build}
										</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Ports */}
					{service.ports?.length > 0 && (
						<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
							<div className="flex items-center gap-2 mb-4">
								<Network className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									PORTS
								</h2>
							</div>

							<div className="flex flex-wrap gap-2">
								{service.ports?.map((port, idx) => (
									<div
										key={idx}
										className="px-3 py-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-md border border-blue-500/20 font-mono text-sm"
									>
										{port}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Environment Variables */}
					{Object.keys(service.environment || {}).length > 0 && (
						<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
							<div className="flex items-center gap-2 mb-4">
								<Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									ENVIRONMENT VARIABLES
								</h2>
							</div>

							<div className="space-y-2 max-h-96 overflow-y-auto">
								{Object.entries(service.environment || {}).map(
									([key, value]) => (
										<div
											key={key}
											className="bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded border border-slate-200 dark:border-slate-800"
										>
											<p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
												{key}
											</p>
											<p className="text-sm font-mono text-slate-900 dark:text-white break-words">
												{value || "—"}
											</p>
										</div>
									),
								)}
							</div>
						</div>
					)}

					{/* Volumes */}
					{service.volumes?.length > 0 && (
						<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
							<div className="flex items-center gap-2 mb-4">
								<HardDrive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									VOLUMES
								</h2>
							</div>

							<div className="space-y-2">
								{service.volumes?.map((volume, idx) => (
									<div
										key={idx}
										className="font-mono text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded border border-slate-200 dark:border-slate-800 break-all"
									>
										{volume}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Command */}
					{service.command && (
						<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
							<div className="flex items-center gap-2 mb-4">
								<Terminal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									COMMAND
								</h2>
							</div>

							<p className="font-mono text-sm text-slate-900 dark:text-white">
								{service.command}
							</p>
						</div>
					)}

					{/* Labels */}
					{service.labels && service.labels.length > 0 && (
						<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
							<div className="flex items-center gap-2 mb-3">
								<Tag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									LABELS
								</h2>
							</div>
							<div className="space-y-2">
								{service.labels.map((label, idx) => {
									const [key, ...valueParts] = label.split("=");
									const value = valueParts.join("=");
									return (
										<div
											key={idx}
											className="bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded border border-slate-200 dark:border-slate-800"
										>
											<p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
												{key}
											</p>
											<p className="text-sm font-mono text-slate-900 dark:text-white break-words">
												{value || "—"}
											</p>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Networks & Restart Policy */}
					{service.networks && service.networks.length > 0 && (
						<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
							<div className="flex items-center gap-2 mb-3">
								<Network className="w-4 h-4 text-purple-600 dark:text-purple-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									NETWORKS
								</h2>
							</div>
							<div className="flex flex-wrap gap-2">
								{service.networks.map((network, idx) => (
									<div
										key={idx}
										className="px-3 py-1.5 bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-md border border-purple-500/20 font-mono text-sm"
									>
										{network}
									</div>
								))}
							</div>
						</div>
					)}

					{service.restart && (
						<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
							<div className="flex items-center gap-2 mb-3">
								<PlayCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									RESTART POLICY
								</h2>
							</div>
							<div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-md border border-emerald-500/20 font-mono text-sm inline-block">
								{service.restart}
							</div>
						</div>
					)}

					{service.depends_on && service.depends_on.length > 0 && (
						<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
							<div className="flex items-center gap-2 mb-3">
								<Layers className="w-4 h-4 text-slate-600 dark:text-slate-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									DEPENDENCIES
								</h2>
							</div>
							<div className="space-y-2">
								{service.depends_on.map((dep, idx) => (
									<Link
										key={idx}
										to="/projects/$name/services/$service"
										params={{ name, service: dep }}
										className="block px-3 py-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-800 font-mono text-sm transition-colors"
									>
										→ {dep}
									</Link>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
