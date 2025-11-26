import {
	Outlet,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import { Header } from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@/features/auth/api/fetchMe";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
	queryClient: QueryClient;
	auth?: { authenticated: boolean; username: string };
}

function RootComponent() {
	const routerState = useRouterState();
	const isLoginPage = routerState.location.pathname === "/login";

	// Fetch auth data for header
	const { data: auth } = useQuery({
		queryKey: ["auth", "me"],
		queryFn: fetchMe,
		enabled: !isLoginPage,
		retry: false,
	});

	if (isLoginPage) {
		return (
			<>
				<Outlet />
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
			</>
		);
	}

	return (
		<>
			<Header username={auth?.username} />
			<main className="flex-1 w-full bg-slate-50 dark:bg-[#0d1117]">
				<Outlet />
			</main>
			<TanStackDevtools
				config={{
					position: "bottom-right",
				}}
				plugins={[
					{
						name: "Tanstack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
					TanStackQueryDevtools,
				]}
			/>
		</>
	);
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: RootComponent,
});
