import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getProjectServices } from "@/features/projects/api/get-services";

export const Route = createFileRoute("/projects/$name/services")({
	loader: async ({ context, params }) => {
		const queryOptions = {
			queryKey: ["project", params.name, "services"],
			queryFn: () => getProjectServices({ name: params.name }),
		};
		await context.queryClient.ensureQueryData(queryOptions);
		return { queryOptions };
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
