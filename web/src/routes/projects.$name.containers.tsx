import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProjectContainers } from "@/features/projects/api/get-containers";
import type { ProjectContainerInfo } from "@/features/projects/types";
import { Server } from "lucide-react";

export const Route = createFileRoute("/projects/$name/containers")({
	loader: async ({ context, params }) => {
		const queryOptions = {
			queryKey: ["project", params.name, "containers"],
			queryFn: () => getProjectContainers({ name: params.name }),
		};
		await context.queryClient.ensureQueryData(queryOptions);
		return { queryOptions };
	},
	component: RouteComponent,
});

function getStateStyles(state: string) {
	const stateMap: Record<string, { dot: string; text: string; bg: string }> = {
		running: {
			dot: "bg-emerald-500",
			text: "text-emerald-700 dark:text-emerald-400",
			bg: "bg-emerald-500/10 border-emerald-500/20",
		},
		exited: {
			dot: "bg-red-500",
			text: "text-red-700 dark:text-red-400",
			bg: "bg-red-500/10 border-red-500/20",
		},
		paused: {
			dot: "bg-amber-500",
			text: "text-amber-700 dark:text-amber-400",
			bg: "bg-amber-500/10 border-amber-500/20",
		},
		restarting: {
			dot: "bg-blue-500 animate-pulse",
			text: "text-blue-700 dark:text-blue-400",
			bg: "bg-blue-500/10 border-blue-500/20",
		},
	};
	return (
		stateMap[state.toLowerCase()] || {
			dot: "bg-slate-400",
			text: "text-slate-600 dark:text-slate-400",
			bg: "bg-slate-500/10 border-slate-500/20",
		}
	);
}

function RouteComponent() {
	const { queryOptions } = Route.useLoaderData();
	const { data } = useSuspenseQuery(queryOptions);

	const containers = (data as { containers: ProjectContainerInfo[] })
		.containers;

	return (
		<div>
			<div className="flex items-center gap-2 mb-6">
				<div className="p-2 rounded-lg bg-blue-500/10">
					<Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
				</div>
				<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
					Containers
				</h2>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{containers.map((container) => {
					const stateStyles = getStateStyles(container.state);
					return (
						<Link
							key={container.id}
							to="/containers/$id"
							params={{ id: container.id }}
							className="block p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 hover:border-blue-300 dark:hover:border-blue-600 transition-colors shadow-sm"
						>
							<div className="flex items-start justify-between gap-3 mb-3">
								<h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate flex-1">
									{container.name}
								</h3>
								<span
									className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${stateStyles.bg} ${stateStyles.text} whitespace-nowrap`}
								>
									<span
										className={`w-1.5 h-1.5 rounded-full ${stateStyles.dot}`}
									/>
									{container.state}
								</span>
							</div>
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-xs">
									<span className="text-slate-500 dark:text-slate-400 font-medium">
										Service:
									</span>
									<span className="text-slate-900 dark:text-white font-mono">
										{container.service}
									</span>
								</div>
								<div className="flex items-center gap-2 text-xs">
									<span className="text-slate-500 dark:text-slate-400 font-medium">
										ID:
									</span>
									<span className="text-slate-900 dark:text-white font-mono">
										{container.id.substring(0, 12)}
									</span>
								</div>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">
									{container.status}
								</p>
							</div>
						</Link>
					);
				})}

				{containers.length === 0 && (
					<div className="col-span-full text-center py-12">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
							<Server className="w-8 h-8 text-slate-400" />
						</div>
						<p className="text-sm text-slate-500 dark:text-slate-400">
							No containers found
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
