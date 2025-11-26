import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProjectEnvironment } from "@/features/projects/api/get-env";
import type { ProjectEnvInfo } from "@/features/projects/types";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/projects/$name/env")({
	loader: async ({ context, params }) => {
		const queryOptions = {
			queryKey: ["project", params.name, "environment"],
			queryFn: () => getProjectEnvironment({ name: params.name }),
		};
		await context.queryClient.ensureQueryData(queryOptions);
		return { queryOptions };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { queryOptions } = Route.useLoaderData();
	const { data } = useSuspenseQuery(queryOptions);

	const environment = (data as { environment: ProjectEnvInfo[] }).environment;

	return (
		<div>
			<div className="flex items-center gap-2 mb-6">
				<div className="p-2 rounded-lg bg-emerald-500/10">
					<Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
				</div>
				<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
					Environment Variables
				</h2>
			</div>

			<div className="space-y-6">
				{environment.map((serviceEnv, idx) => (
					<div key={idx}>
						<div className="flex items-center gap-2 mb-3">
							<div className="w-2 h-2 rounded-full bg-emerald-500" />
							<h3 className="text-base font-semibold text-slate-900 dark:text-white">
								{serviceEnv.service}
							</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{Object.entries(serviceEnv.env).map(([key, value]) => (
								<div
									key={key}
									className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm"
								>
									<p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
										{key}
									</p>
									<p className="text-sm font-mono text-slate-900 dark:text-white break-all">
										{value || "—"}
									</p>
								</div>
							))}
						</div>
					</div>
				))}

				{environment.length === 0 && (
					<div className="text-center py-12">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
							<Settings className="w-8 h-8 text-slate-400" />
						</div>
						<p className="text-sm text-slate-500 dark:text-slate-400">
							No environment variables found
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
