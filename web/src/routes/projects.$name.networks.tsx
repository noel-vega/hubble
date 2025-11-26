import { createFileRoute } from "@tanstack/react-router";
import {
	useSuspenseQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getProjectNetworks } from "@/features/projects/api/get-networks";
import { AddProjectNetwork } from "@/features/projects/api/post-add-network";
import { updateProjectNetwork } from "@/features/projects/api/update-network";
import { deleteProjectNetwork } from "@/features/projects/api/delete-network";
import { Network, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export const Route = createFileRoute("/projects/$name/networks")({
	loader: async ({ context, params }) => {
		const queryOptions = {
			queryKey: ["project", params.name, "networks"],
			queryFn: () => getProjectNetworks({ projectName: params.name }),
		};
		await context.queryClient.ensureQueryData(queryOptions);
		return { queryOptions };
	},
	component: RouteComponent,
});

interface NetworkFormData {
	name: string;
	driver: string;
	external: boolean;
}

function RouteComponent() {
	const { name } = Route.useParams();
	const { queryOptions } = Route.useLoaderData();
	const { data } = useSuspenseQuery(queryOptions);
	const queryClient = useQueryClient();

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [editingNetwork, setEditingNetwork] = useState<string | null>(null);
	const [deletingNetwork, setDeletingNetwork] = useState<string | null>(null);
	const [formData, setFormData] = useState<NetworkFormData>({
		name: "",
		driver: "bridge",
		external: false,
	});

	const networks = (data as { networks: any[] }).networks;

	const addNetworkMutation = useMutation({
		mutationFn: AddProjectNetwork,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
			setIsAddDialogOpen(false);
			setFormData({ name: "", driver: "bridge", external: false });
		},
	});

	const updateNetworkMutation = useMutation({
		mutationFn: updateProjectNetwork,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
			setEditingNetwork(null);
			setFormData({ name: "", driver: "bridge", external: false });
		},
	});

	const deleteNetworkMutation = useMutation({
		mutationFn: deleteProjectNetwork,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
			setDeletingNetwork(null);
		},
	});

	const handleAddNetwork = () => {
		addNetworkMutation.mutate({
			projectName: name,
			network: {
				name: formData.name,
				driver: formData.external ? undefined : formData.driver,
				external: formData.external,
				config: {},
			},
		});
	};

	const handleUpdateNetwork = (originalName: string) => {
		updateNetworkMutation.mutate({
			projectName: name,
			networkName: originalName,
			network: {
				name: formData.name,
				driver: formData.external ? undefined : formData.driver,
				external: formData.external,
				config: {},
			},
		});
	};

	const handleEditClick = (network: any) => {
		setEditingNetwork(network.name);
		setFormData({
			name: network.name,
			driver: network.driver || "bridge",
			external: network.external || false,
		});
	};

	const handleDeleteClick = (networkName: string) => {
		setDeletingNetwork(networkName);
	};

	const handleDeleteConfirm = () => {
		if (deletingNetwork) {
			deleteNetworkMutation.mutate({
				projectName: name,
				networkName: deletingNetwork,
			});
		}
	};

	return (
		<div>
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-lg bg-blue-500/10">
						<Network className="w-6 h-6 text-blue-600 dark:text-blue-400" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
							Networks
						</h1>
						<p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
							Manage Docker networks for {name}
						</p>
					</div>
				</div>
				<Button
					onClick={() => setIsAddDialogOpen(true)}
					className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
				>
					<Plus className="w-4 h-4" />
					Add Network
				</Button>
			</div>

			{/* Networks List */}
			<div className="space-y-3">
				{networks.length === 0 ? (
					<div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg">
						<Network className="w-12 h-12 text-slate-400 mx-auto mb-3" />
						<p className="text-slate-500 dark:text-slate-400 mb-4">
							No networks configured
						</p>
						<Button
							onClick={() => setIsAddDialogOpen(true)}
							variant="outline"
							className="gap-2"
						>
							<Plus className="w-4 h-4" />
							Add Your First Network
						</Button>
					</div>
				) : (
					networks.map((network) => (
						<div
							key={network.name}
							className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
						>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-3">
										<div className="p-2 rounded-lg bg-blue-500/10">
											<Network className="w-5 h-5 text-blue-600 dark:text-blue-400" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<h3 className="text-lg font-semibold text-slate-900 dark:text-white">
													{network.name}
												</h3>
												{network.external && (
													<span className="px-2 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded border border-purple-500/20">
														External
													</span>
												)}
											</div>
											<p className="text-sm text-slate-500 dark:text-slate-400">
												Driver: {network.driver || "bridge"}
											</p>
										</div>
									</div>

									{network.config && Object.keys(network.config).length > 0 && (
										<div className="ml-11 mt-3">
											<p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
												Configuration:
											</p>
											<div className="bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded border border-slate-200 dark:border-slate-800">
												<pre className="text-xs font-mono text-slate-700 dark:text-slate-300">
													{JSON.stringify(network.config, null, 2)}
												</pre>
											</div>
										</div>
									)}
								</div>

								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleEditClick(network)}
										className="gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
									>
										<Edit2 className="w-4 h-4" />
										Edit
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleDeleteClick(network.name)}
										className="gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
									>
										<Trash2 className="w-4 h-4" />
										Delete
									</Button>
								</div>
							</div>
						</div>
					))
				)}
			</div>

			{/* Add Network Dialog */}
			<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Network</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="add-network-name">Network Name</Label>
							<Input
								id="add-network-name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="frontend"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="add-network-driver">Driver</Label>
							<select
								id="add-network-driver"
								value={formData.driver}
								onChange={(e) =>
									setFormData({ ...formData, driver: e.target.value })
								}
								disabled={formData.external}
								className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
							>
								<option value="bridge">bridge</option>
								<option value="host">host</option>
								<option value="overlay">overlay</option>
								<option value="macvlan">macvlan</option>
								<option value="none">none</option>
							</select>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{formData.external
									? "Driver is managed externally and cannot be modified"
									: "Network driver type (usually bridge for local development)"}
							</p>
						</div>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="add-network-external"
									checked={formData.external}
									onChange={(e) =>
										setFormData({ ...formData, external: e.target.checked })
									}
									className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:focus:ring-blue-600"
								/>
								<Label
									htmlFor="add-network-external"
									className="cursor-pointer"
								>
									External Network
								</Label>
							</div>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Check this if the network already exists outside of this Docker
								Compose project
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsAddDialogOpen(false)}
							disabled={addNetworkMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleAddNetwork}
							disabled={!formData.name || addNetworkMutation.isPending}
							className="bg-blue-600 hover:bg-blue-700 text-white"
						>
							{addNetworkMutation.isPending ? "Adding..." : "Add Network"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Network Dialog */}
			<Dialog
				open={editingNetwork !== null}
				onOpenChange={(open) => !open && setEditingNetwork(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Network</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="edit-network-name">Network Name</Label>
							<Input
								id="edit-network-name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="frontend"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-network-driver">Driver</Label>
							<select
								id="edit-network-driver"
								value={formData.driver}
								onChange={(e) =>
									setFormData({ ...formData, driver: e.target.value })
								}
								disabled={formData.external}
								className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
							>
								<option value="bridge">bridge</option>
								<option value="host">host</option>
								<option value="overlay">overlay</option>
								<option value="macvlan">macvlan</option>
								<option value="none">none</option>
							</select>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{formData.external
									? "Driver is managed externally and cannot be modified"
									: "Network driver type"}
							</p>
						</div>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="edit-network-external"
									checked={formData.external}
									onChange={(e) =>
										setFormData({ ...formData, external: e.target.checked })
									}
									className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:focus:ring-blue-600"
								/>
								<Label
									htmlFor="edit-network-external"
									className="cursor-pointer"
								>
									External Network
								</Label>
							</div>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Check this if the network already exists outside of this Docker
								Compose project
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setEditingNetwork(null)}
							disabled={updateNetworkMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={() =>
								editingNetwork && handleUpdateNetwork(editingNetwork)
							}
							disabled={!formData.name || updateNetworkMutation.isPending}
							className="bg-blue-600 hover:bg-blue-700 text-white"
						>
							{updateNetworkMutation.isPending
								? "Updating..."
								: "Update Network"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={deletingNetwork !== null}
				onOpenChange={(open) => !open && setDeletingNetwork(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Network</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete the network "{deletingNetwork}"?
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteNetworkMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							disabled={deleteNetworkMutation.isPending}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							{deleteNetworkMutation.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
