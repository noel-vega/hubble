import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import {
	useSuspenseQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getContainer } from "@/features/containers/api/get-container";
import { postStartContainer } from "@/features/containers/api/post-start-container";
import { postStopContainer } from "@/features/containers/api/post-stop-container";
import { fetchMe } from "@/features/auth/api/fetchMe";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Play,
	Square,
	Server,
	Clock,
	HardDrive,
	Network,
	Tag,
	Cpu,
	MemoryStick,
	Activity,
	Layers,
	Settings,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/containers/$id")({
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
		const queryOptions = {
			queryKey: ["container", params.id],
			queryFn: () => getContainer({ id: params.id }),
		};
		const container = await context.queryClient.ensureQueryData(queryOptions);
		return { queryOptions, container };
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

function formatDate(dateStr: string) {
	try {
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return "N/A";
		return date.toLocaleString();
	} catch {
		return "N/A";
	}
}

function formatBytes(bytes: number) {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}

function InfoCard({
	title,
	icon: Icon,
	children,
	className = "",
}: {
	title: string;
	icon: typeof Server;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-6 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 ${className}`}
		>
			<div className="flex items-center gap-2 mb-5">
				<div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/10">
					<Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
				</div>
				<h2 className="text-base font-semibold text-slate-900 dark:text-white">
					{title}
				</h2>
			</div>
			<div className="space-y-3">{children}</div>
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex justify-between items-start gap-4 py-2.5">
			<span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex-shrink-0">
				{label}
			</span>
			<span className="text-sm text-slate-900 dark:text-white text-right break-all font-medium">
				{value}
			</span>
		</div>
	);
}

function RouteComponent() {
	const { queryOptions } = Route.useLoaderData();
	const { data: container } = useSuspenseQuery(queryOptions);
	const queryClient = useQueryClient();
	const [isStarting, setIsStarting] = useState(false);
	const [isStopping, setIsStopping] = useState(false);

	const stateStyles = getStateStyles(container.state.status);
	const isRunning = container.state.running;
	const isExited = !container.state.running && !container.state.paused;

	const startContainer = useMutation({
		mutationFn: postStartContainer,
		onMutate: () => setIsStarting(true),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["container", container.id] });
			queryClient.invalidateQueries({ queryKey: ["containers"] });
		},
		onError: (error) => console.error("Failed to start container:", error),
		onSettled: () => setIsStarting(false),
	});

	const stopContainer = useMutation({
		mutationFn: postStopContainer,
		onMutate: () => setIsStopping(true),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["container", container.id] });
			queryClient.invalidateQueries({ queryKey: ["containers"] });
		},
		onError: (error) => console.error("Failed to stop container:", error),
		onSettled: () => setIsStopping(false),
	});

	return (
		<div className="bg-slate-50 dark:bg-[#0d1117] min-h-screen">
			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* Header */}
				<div className="mb-8">
					<Link
						to="/containers"
						className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors group"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to containers
					</Link>

					<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-6 shadow-sm">
						<div className="flex items-start justify-between gap-4 flex-wrap mb-6">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-3 mb-3">
									<h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
										{container.name}
									</h1>
									<span
										className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${stateStyles.bg} ${stateStyles.text}`}
									>
										<span
											className={`w-1.5 h-1.5 rounded-full ${stateStyles.dot}`}
										/>
										{container.state.status}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<p className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
										{container.id.substring(0, 12)}
									</p>
									<span className="text-slate-300 dark:text-slate-700">•</span>
									<p className="text-sm text-slate-600 dark:text-slate-400">
										{container.image}
									</p>
								</div>
							</div>

							<div className="flex gap-2">
								{isExited && (
									<Button
										onClick={() => startContainer.mutate({ id: container.id })}
										disabled={isStarting}
										className="gap-2"
									>
										<Play
											className={`w-4 h-4 ${isStarting ? "animate-pulse" : ""}`}
										/>
										{isStarting ? "Starting..." : "Start"}
									</Button>
								)}
								{isRunning && (
									<Button
										variant="destructive"
										onClick={() => stopContainer.mutate({ id: container.id })}
										disabled={isStopping}
										className="gap-2"
									>
										<Square
											className={`w-4 h-4 ${isStopping ? "animate-pulse" : ""}`}
										/>
										{isStopping ? "Stopping..." : "Stop"}
									</Button>
								)}
							</div>
						</div>

						{/* Quick Stats */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-blue-500/10">
									<Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Platform
									</p>
									<p className="text-sm font-semibold text-slate-900 dark:text-white">
										{container.platform}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-purple-500/10">
									<Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
								</div>
								<div>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Uptime
									</p>
									<p className="text-sm font-semibold text-slate-900 dark:text-white">
										{container.state.running
											? formatDate(container.state.started_at)
											: "Not running"}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-emerald-500/10">
									<Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
								</div>
								<div>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Restart Count
									</p>
									<p className="text-sm font-semibold text-slate-900 dark:text-white">
										{container.restart_count || 0}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-amber-500/10">
									<Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
								</div>
								<div>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Networks
									</p>
									<p className="text-sm font-semibold text-slate-900 dark:text-white">
										{Object.keys(container.networks).length}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Grid Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* General Info */}
					<InfoCard title="Container Details" icon={Server}>
						<InfoRow label="Image" value={container.image} />
						<InfoRow label="Created" value={formatDate(container.created)} />
						<InfoRow
							label="Started At"
							value={formatDate(container.state.started_at)}
						/>
						{!container.state.running && (
							<InfoRow
								label="Finished At"
								value={formatDate(container.state.finished_at)}
							/>
						)}
						<InfoRow
							label="Exit Code"
							value={
								<span
									className={
										container.state.exit_code === 0
											? "text-emerald-600 dark:text-emerald-400"
											: "text-red-600 dark:text-red-400"
									}
								>
									{container.state.exit_code}
								</span>
							}
						/>
						<InfoRow label="Process ID" value={container.state.pid || "N/A"} />
						<InfoRow
							label="Restart Policy"
							value={container.restart_policy || "None"}
						/>
					</InfoCard>

					{/* State Info */}
					<InfoCard title="State Information" icon={Activity}>
						<InfoRow
							label="Running"
							value={
								<span
									className={
										container.state.running
											? "text-emerald-600 dark:text-emerald-400"
											: "text-slate-600 dark:text-slate-400"
									}
								>
									{container.state.running ? "Yes" : "No"}
								</span>
							}
						/>
						<InfoRow
							label="Paused"
							value={
								<span
									className={
										container.state.paused
											? "text-amber-600 dark:text-amber-400"
											: "text-slate-600 dark:text-slate-400"
									}
								>
									{container.state.paused ? "Yes" : "No"}
								</span>
							}
						/>
						<InfoRow
							label="Restarting"
							value={
								<span
									className={
										container.state.restarting
											? "text-blue-600 dark:text-blue-400"
											: "text-slate-600 dark:text-slate-400"
									}
								>
									{container.state.restarting ? "Yes" : "No"}
								</span>
							}
						/>
						<InfoRow
							label="OOM Killed"
							value={
								<span
									className={
										container.state.oom_killed
											? "text-red-600 dark:text-red-400"
											: "text-slate-600 dark:text-slate-400"
									}
								>
									{container.state.oom_killed ? "Yes" : "No"}
								</span>
							}
						/>
						<InfoRow
							label="Dead"
							value={
								<span
									className={
										container.state.dead
											? "text-red-600 dark:text-red-400"
											: "text-slate-600 dark:text-slate-400"
									}
								>
									{container.state.dead ? "Yes" : "No"}
								</span>
							}
						/>
					</InfoCard>

					{/* Resource Limits */}
					<InfoCard title="Resource Configuration" icon={Cpu}>
						<InfoRow
							label="CPU Shares"
							value={
								<span className="font-mono text-xs">
									{container.host_config.cpu_shares || "Default"}
								</span>
							}
						/>
						<InfoRow
							label="CPU Limit"
							value={
								<span className="font-mono text-xs">
									{container.host_config.nano_cpus
										? `${container.host_config.nano_cpus / 1e9} CPUs`
										: "Unlimited"}
								</span>
							}
						/>
						<InfoRow
							label="Memory Limit"
							value={
								<span className="font-mono text-xs">
									{container.host_config.memory
										? formatBytes(container.host_config.memory)
										: "Unlimited"}
								</span>
							}
						/>
						<InfoRow
							label="Memory Reservation"
							value={
								<span className="font-mono text-xs">
									{container.host_config.memory_reservation
										? formatBytes(container.host_config.memory_reservation)
										: "None"}
								</span>
							}
						/>
						<InfoRow
							label="Memory Swap"
							value={
								<span className="font-mono text-xs">
									{container.host_config.memory_swap === -1
										? "Unlimited"
										: container.host_config.memory_swap
											? formatBytes(container.host_config.memory_swap)
											: "None"}
								</span>
							}
						/>
					</InfoCard>

					{/* Network Info */}
					<InfoCard title="Network Configuration" icon={Network}>
						<InfoRow
							label="Network Mode"
							value={
								<span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
									{container.host_config.network_mode}
								</span>
							}
						/>
						{Object.entries(container.networks).map(([name, network]) => (
							<div
								key={name}
								className="space-y-2 pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 first:border-t-0 first:mt-0 first:pt-0"
							>
								<div className="flex items-center gap-2 mb-2">
									<div className="p-1 rounded bg-purple-500/10">
										<Network className="w-3 h-3 text-purple-600 dark:text-purple-400" />
									</div>
									<span className="font-semibold text-sm text-slate-900 dark:text-white">
										{name}
									</span>
								</div>
								<InfoRow
									label="IP Address"
									value={
										<span className="font-mono text-xs">
											{network.ip_address || "N/A"}
										</span>
									}
								/>
								<InfoRow
									label="Gateway"
									value={
										<span className="font-mono text-xs">
											{network.gateway || "N/A"}
										</span>
									}
								/>
								<InfoRow
									label="MAC Address"
									value={
										<span className="font-mono text-xs">
											{network.mac_address || "N/A"}
										</span>
									}
								/>
							</div>
						))}
					</InfoCard>

					{/* Ports */}
					{container.ports.length > 0 && (
						<InfoCard title="Port Mappings" icon={Settings}>
							<div className="space-y-2">
								{container.ports.map((port, idx) => (
									<div
										key={idx}
										className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
									>
										<div className="flex items-center gap-3">
											<span className="px-2 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase">
												{port.type}
											</span>
											<span className="text-sm font-mono text-slate-900 dark:text-white">
												{port.private}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-slate-400">→</span>
											<span className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">
												{port.public}
											</span>
										</div>
									</div>
								))}
							</div>
						</InfoCard>
					)}

					{/* Mounts */}
					{container.mounts.length > 0 && (
						<InfoCard title="Volume Mounts" icon={HardDrive}>
							<div className="space-y-3">
								{container.mounts.map((mount, idx) => (
									<div
										key={idx}
										className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
									>
										<div className="flex items-center gap-2 mb-2">
											<span className="px-2 py-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase">
												{mount.type}
											</span>
											<span
												className={`px-2 py-1 rounded text-xs font-semibold ${
													mount.rw
														? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
														: "bg-amber-500/10 text-amber-700 dark:text-amber-400"
												}`}
											>
												{mount.rw ? "Read/Write" : "Read-Only"}
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<span className="font-mono text-slate-600 dark:text-slate-400 break-all">
												{mount.source}
											</span>
											<span className="text-slate-400 flex-shrink-0">→</span>
											<span className="font-mono text-slate-900 dark:text-white break-all">
												{mount.destination}
											</span>
										</div>
									</div>
								))}
							</div>
						</InfoCard>
					)}

					{/* Labels */}
					{Object.keys(container.labels).length > 0 && (
						<InfoCard title="Labels" icon={Tag}>
							<div className="space-y-2">
								{Object.entries(container.labels).map(([key, value]) => (
									<div
										key={key}
										className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50"
									>
										<Tag className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
										<div className="flex-1 min-w-0">
											<p className="text-xs font-semibold text-slate-900 dark:text-white mb-0.5">
												{key}
											</p>
											<p className="text-xs text-slate-600 dark:text-slate-400 break-all">
												{value || "—"}
											</p>
										</div>
									</div>
								))}
							</div>
						</InfoCard>
					)}

					{/* Environment Variables */}
					{container.env && container.env.length > 0 && (
						<InfoCard title="Environment Variables" icon={MemoryStick}>
							<div className="space-y-2">
								{container.env.map((envVar, idx) => {
									const [key, ...valueParts] = envVar.split("=");
									const value = valueParts.join("=");
									return (
										<div
											key={idx}
											className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50"
										>
											<p className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
												{key}
											</p>
											<p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
												{value || "—"}
											</p>
										</div>
									);
								})}
							</div>
						</InfoCard>
					)}
				</div>
			</div>
		</div>
	);
}
