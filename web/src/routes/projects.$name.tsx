import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getProjects } from "@/features/projects/api/get-projects";
import { fetchMe } from "@/features/auth/api/fetchMe";

export const Route = createFileRoute("/projects/$name")({
	beforeLoad: async ({ context }) => {
		try {
			const auth = await context.queryClient.ensureQueryData({
				queryKey: ["auth", "me"],
				queryFn: fetchMe,
			});

			if (!auth.authenticated) {
				throw redirect({ to: "/login" });
			}

			return { auth };
		} catch (error) {
			// If auth check fails or any error occurs, redirect to login
			throw redirect({ to: "/login" });
		}
	},
	loader: async ({ context, params }) => {
		// Get all projects to find this specific one
		const projectsResponse = await context.queryClient.ensureQueryData({
			queryKey: ["projects"],
			queryFn: getProjects,
		});

		const project = projectsResponse.projects.find(
			(p) => p.name === params.name,
		);

		if (!project) {
			throw redirect({ to: "/projects" });
		}

		return { project };
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="bg-slate-50 dark:bg-[#0d1117] min-h-screen">
			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* Content */}
				<Outlet />
			</div>
		</div>
	);
}
