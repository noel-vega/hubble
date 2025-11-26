import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProjectDockerCompose } from "@/features/projects/api/get-compose";
import { FileCode2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/projects/$name/")({
	loader: async ({ context, params }) => {
		const queryOptions = {
			queryKey: ["project", params.name, "compose"],
			queryFn: () => getProjectDockerCompose({ name: params.name }),
		};
		await context.queryClient.ensureQueryData(queryOptions);
		return { queryOptions };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { queryOptions } = Route.useLoaderData();
	const { data } = useSuspenseQuery(queryOptions);

	const composeContent = (data as { content: string }).content;

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-lg bg-slate-500/10">
						<FileCode2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
					</div>
					<h2 className="text-base font-semibold text-slate-900 dark:text-white">
						docker-compose.yml
					</h2>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => {
						navigator.clipboard.writeText(composeContent);
					}}
					className="text-xs h-7 px-2 gap-1.5"
				>
					<Copy className="w-3.5 h-3.5" />
					Copy
				</Button>
			</div>
			<pre className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-4 overflow-x-auto shadow-sm">
				{composeContent}
			</pre>
		</div>
	);
}
