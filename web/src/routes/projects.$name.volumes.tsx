import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProjectVolumes } from "@/features/projects/api/get-volumes";
import type { ProjectVolumeInfo } from "@/features/projects/types";
import { HardDrive } from "lucide-react";

export const Route = createFileRoute("/projects/$name/volumes")({
	loader: async ({ context, params }) => {
		const queryOptions = {
			queryKey: ["project", params.name, "volumes"],
			queryFn: () => getProjectVolumes({ name: params.name }),
		};
		await context.queryClient.ensureQueryData(queryOptions);
		return { queryOptions };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { queryOptions } = Route.useLoaderData();
	const { data } = useSuspenseQuery(queryOptions);

	const volumes = (data as { volumes: ProjectVolumeInfo[] }).volumes;

	return (
		<div>
			<div className="flex items-center gap-2 mb-6">
				<div className="p-2 rounded-lg bg-purple-500/10">
					<HardDrive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
				</div>
				<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
					Volumes
				</h2>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{volumes.map((volume, idx) => (
					<div
						key={idx}
						className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm"
					>
						<div className="flex items-center gap-2 mb-3">
							<HardDrive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
							<h3 className="text-sm font-semibold text-slate-900 dark:text-white">
								{volume.service}
							</h3>
						</div>
						<p className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded border border-slate-200 dark:border-slate-700 break-all">
							{volume.volume}
						</p>
					</div>
				))}

				{volumes.length === 0 && (
					<div className="col-span-full text-center py-12">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
							<HardDrive className="w-8 h-8 text-slate-400" />
						</div>
						<p className="text-sm text-slate-500 dark:text-slate-400">
							No volumes found
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
