import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/containers")({
	component: () => <Outlet />,
});
