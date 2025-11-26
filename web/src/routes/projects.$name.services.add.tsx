import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { postAddService } from "@/features/projects/api/post-add-service";
import { getRegistryCatalog } from "@/features/registry/api/get-catalog";
import {
	ArrowLeft,
	Loader2,
	ChevronDown,
	Check,
	Info,
	AlertCircle,
	Plus,
	X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/projects/$name/services/add")({
	component: RouteComponent,
});

interface ImageSelectorProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

function ImageSelector({ value, onChange, disabled }: ImageSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const catalogQuery = useQuery({
		queryKey: ["registry", "catalog"],
		queryFn: getRegistryCatalog,
	});

	const allImages = useMemo(() => {
		if (!catalogQuery.data?.repositories || !catalogQuery.data?.registry) {
			console.log("No repositories data available");
			return [];
		}
		console.log("Registry data:", catalogQuery.data);
		const registryHost = catalogQuery.data.registry;
		const images: { repo: string; tag: string; fullImage: string }[] = [];
		for (const repo of catalogQuery.data.repositories) {
			if (!repo.tags || repo.tags.length === 0) {
				console.log(`Repository ${repo.name} has no tags`);
				continue;
			}
			for (const tag of repo.tags) {
				images.push({
					repo: repo.name,
					tag: tag,
					fullImage: `${registryHost}/${repo.name}:${tag}`,
				});
			}
		}
		console.log(`Total images: ${images.length}`, images);
		return images;
	}, [catalogQuery.data]);

	const filteredImages = useMemo(() => {
		if (!searchQuery.trim()) return allImages;
		return allImages.filter(
			(img) =>
				img.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
				img.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
				img.fullImage.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [allImages, searchQuery]);

	const handleSelectImage = (image: string) => {
		onChange(image);
		setIsOpen(false);
		setSearchQuery("");
	};

	return (
		<div className="relative">
			<div className="flex gap-2">
				<Input
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder="nginx:latest or select from registry"
					disabled={disabled}
					className="flex-1"
				/>
				<Button
					type="button"
					variant="outline"
					onClick={() => setIsOpen(!isOpen)}
					disabled={disabled || catalogQuery.isLoading}
					className="gap-2"
				>
					{catalogQuery.isLoading ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						<ChevronDown className="w-4 h-4" />
					)}
					Registry
				</Button>
			</div>

			{isOpen && (
				<div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg max-h-[400px] overflow-hidden flex flex-col">
					<div className="p-3 border-b border-slate-200 dark:border-slate-800">
						<Input
							type="text"
							placeholder="Search images..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full"
							autoFocus
						/>
					</div>
					<div className="overflow-y-auto flex-1">
						{catalogQuery.isLoading ? (
							<div className="p-4 text-center text-sm text-slate-500">
								Loading registry images...
							</div>
						) : catalogQuery.isError ? (
							<div className="p-4 text-center text-sm text-red-500">
								Error loading registry:{" "}
								{catalogQuery.error?.message || "Unknown error"}
							</div>
						) : filteredImages.length > 0 ? (
							<div className="p-2">
								{filteredImages.map((img) => (
									<button
										key={img.fullImage}
										type="button"
										onClick={() => handleSelectImage(img.fullImage)}
										className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
									>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-sm text-slate-900 dark:text-white truncate">
												{img.repo}
											</div>
											<div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
												{img.tag}
											</div>
										</div>
										{value === img.fullImage && (
											<Check className="w-4 h-4 text-blue-500 shrink-0" />
										)}
									</button>
								))}
							</div>
						) : (
							<div className="p-4 text-center">
								<p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
									{searchQuery
										? "No images found matching your search"
										: "No images available in registry"}
								</p>
								{!searchQuery &&
									allImages.length === 0 &&
									catalogQuery.data && (
										<p className="text-xs text-slate-400">
											Found {catalogQuery.data.repositories?.length || 0}{" "}
											repositories
										</p>
									)}
							</div>
						)}
					</div>
					<div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								setIsOpen(false);
								setSearchQuery("");
							}}
							className="w-full"
						>
							Close
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

function RouteComponent() {
	const { name } = Route.useParams();
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("basics");
	const [formData, setFormData] = useState({
		name: "",
		image: "",
		build: "",
		ports: "",
		environment: "",
		volumes: "",
		depends_on: "",
		networks: "",
		restart: "",
		command: "",
	});
	const [labels, setLabels] = useState<{ key: string; value: string }[]>([
		{ key: "", value: "" },
	]);

	const addServiceMutation = useMutation({
		mutationFn: postAddService,
		onSuccess: () => {
			navigate({
				to: "/projects/$name/services",
				params: { name },
			});
		},
		onError: (error: Error) => {
			setError(error.message || "Failed to add service");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim()) {
			setError("Service name is required");
			setActiveTab("basics");
			return;
		}
		if (!formData.image.trim() && !formData.build.trim()) {
			setError("Either image or build context is required");
			setActiveTab("basics");
			return;
		}

		setError(null);

		const service = {
			name: formData.name.trim(),
			image: formData.image.trim(),
			build: formData.build.trim(),
			ports: formData.ports
				? formData.ports
						.split(",")
						.map((p) => p.trim())
						.filter(Boolean)
				: [],
			environment: formData.environment
				? Object.fromEntries(
						formData.environment
							.split(",")
							.map((e) => e.trim())
							.filter(Boolean)
							.map((e) => {
								const [key, ...valueParts] = e.split("=");
								return [key, valueParts.join("=")];
							}),
					)
				: {},
			volumes: formData.volumes
				? formData.volumes
						.split(",")
						.map((v) => v.trim())
						.filter(Boolean)
				: [],
			labels: labels
				.filter((label) => label.key.trim() && label.value.trim())
				.map((label) => `${label.key.trim()}=${label.value.trim()}`),
			depends_on: formData.depends_on
				? formData.depends_on
						.split(",")
						.map((d) => d.trim())
						.filter(Boolean)
				: [],
			networks: formData.networks
				? formData.networks
						.split(",")
						.map((n) => n.trim())
						.filter(Boolean)
				: [],
			restart: formData.restart.trim(),
			command: formData.command.trim(),
		};

		addServiceMutation.mutate({ projectName: name, service });
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	// Helper function to handle pasting full labels (key=value)
	const handleLabelPaste = (
		e: React.ClipboardEvent<HTMLInputElement>,
		index: number,
	) => {
		let pastedText = e.clipboardData.getData("text").trim();

		// Check if the pasted text contains an '=' sign (full label format)
		if (pastedText.includes("=")) {
			e.preventDefault(); // Prevent default paste behavior

			// Trim surrounding double quotes if present (e.g., "key=value" -> key=value)
			if (pastedText.startsWith('"') && pastedText.endsWith('"')) {
				pastedText = pastedText.slice(1, -1);
			}

			// Split by the first '=' sign only
			const firstEqualIndex = pastedText.indexOf("=");
			const key = pastedText.substring(0, firstEqualIndex).trim();
			const value = pastedText.substring(firstEqualIndex + 1).trim();

			// Update the label with both key and value
			const newLabels = [...labels];
			newLabels[index] = { key, value };
			setLabels(newLabels);
		}
		// Otherwise, let the default paste behavior happen (just paste into the field)
	};

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-[#0d1117]">
			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* Header */}
				<div className="mb-8">
					<Link
						to="/projects/$name/services"
						params={{ name }}
						className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors group"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to Services
					</Link>

					<h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
						Add Service
					</h1>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Form */}
					<div className="lg:col-span-2">
						<form onSubmit={handleSubmit}>
							<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
								{/* Info Banner */}
								<div className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-900 p-4">
									<div className="flex gap-3">
										<Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
										<div className="text-sm text-blue-900 dark:text-blue-200">
											<p className="font-medium mb-1">
												Docker Compose Service Configuration
											</p>
											<p className="text-blue-700 dark:text-blue-300">
												Configure your service with Docker Compose settings.
												Fill in the basic information to get started, then
												customize advanced settings as needed.
											</p>
										</div>
									</div>
								</div>

								<Tabs
									value={activeTab}
									onValueChange={setActiveTab}
									className="w-full"
								>
									<TabsList className="px-6">
										<TabsTrigger value="basics">Basics</TabsTrigger>
										<TabsTrigger value="networking">Networking</TabsTrigger>
										<TabsTrigger value="storage">Storage</TabsTrigger>
										<TabsTrigger value="labels">Labels</TabsTrigger>
										<TabsTrigger value="advanced">Advanced</TabsTrigger>
									</TabsList>

									{/* Basics Tab */}
									<TabsContent value="basics" className="p-6 space-y-6">
										<div>
											<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
												Service Details
											</h3>

											{/* Service Name */}
											<div className="space-y-2 mb-6">
												<Label htmlFor="name" className="text-sm font-medium">
													Service Name <span className="text-red-500">*</span>
												</Label>
												<Input
													id="name"
													value={formData.name}
													onChange={(e) =>
														handleInputChange("name", e.target.value)
													}
													placeholder="web"
													disabled={addServiceMutation.isPending}
												/>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													A unique identifier for this service in your compose
													file
												</p>
											</div>

											{/* Image */}
											<div className="space-y-2 mb-6">
												<Label htmlFor="image" className="text-sm font-medium">
													Docker Image
												</Label>
												<ImageSelector
													value={formData.image}
													onChange={(value) =>
														handleInputChange("image", value)
													}
													disabled={addServiceMutation.isPending}
												/>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													Select from registry or enter a Docker Hub image
													(e.g., nginx:latest, postgres:15)
												</p>
											</div>

											{/* Build Context */}
											<div className="space-y-2">
												<Label htmlFor="build" className="text-sm font-medium">
													Build Context
												</Label>
												<Input
													id="build"
													value={formData.build}
													onChange={(e) =>
														handleInputChange("build", e.target.value)
													}
													placeholder="./path/to/dockerfile"
													disabled={addServiceMutation.isPending}
												/>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													Path to build context (use instead of image to build
													from Dockerfile)
												</p>
											</div>
										</div>
									</TabsContent>

									{/* Networking Tab */}
									<TabsContent value="networking" className="p-6 space-y-6">
										<div>
											<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
												Network Configuration
											</h3>

											{/* Ports */}
											<div className="space-y-2 mb-6">
												<Label htmlFor="ports" className="text-sm font-medium">
													Port Mappings
												</Label>
												<Input
													id="ports"
													value={formData.ports}
													onChange={(e) =>
														handleInputChange("ports", e.target.value)
													}
													placeholder="8080:80, 443:443"
													disabled={addServiceMutation.isPending}
												/>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													Comma-separated port mappings in format HOST:CONTAINER
												</p>
											</div>

											{/* Networks */}
											<div className="space-y-2">
												<Label
													htmlFor="networks"
													className="text-sm font-medium"
												>
													Networks
												</Label>
												<Input
													id="networks"
													value={formData.networks}
													onChange={(e) =>
														handleInputChange("networks", e.target.value)
													}
													placeholder="frontend, backend"
													disabled={addServiceMutation.isPending}
												/>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													Comma-separated network names this service should
													connect to
												</p>
											</div>
										</div>
									</TabsContent>

									{/* Storage Tab */}
									<TabsContent value="storage" className="p-6 space-y-6">
										<div>
											<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
												Storage & Volumes
											</h3>

											{/* Volumes */}
											<div className="space-y-2">
												<Label
													htmlFor="volumes"
													className="text-sm font-medium"
												>
													Volume Mounts
												</Label>
												<Input
													id="volumes"
													value={formData.volumes}
													onChange={(e) =>
														handleInputChange("volumes", e.target.value)
													}
													placeholder="./data:/app/data, ./config:/app/config"
													disabled={addServiceMutation.isPending}
												/>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													Comma-separated volume mappings in format
													HOST_PATH:CONTAINER_PATH
												</p>
											</div>
										</div>
									</TabsContent>

									{/* Labels Tab */}
									<TabsContent value="labels" className="p-6 space-y-6">
										<div>
											<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
												Labels & Metadata
											</h3>
											<p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
												Add labels to your service for organization, filtering,
												and integration with tools like Traefik, Prometheus, and
												more.
											</p>

											{/* Labels Key-Value Pairs */}
											<div className="space-y-3">
												<Label className="text-sm font-medium">Labels</Label>
												{labels.map((label, index) => (
													<div key={index} className="flex gap-2 items-start">
														<div className="flex-1 grid grid-cols-2 gap-2">
															<Input
																placeholder="Key (e.g., com.example.description)"
																value={label.key}
																onChange={(e) => {
																	const newLabels = [...labels];
																	newLabels[index].key = e.target.value;
																	setLabels(newLabels);
																}}
																onPaste={(e) => handleLabelPaste(e, index)}
																disabled={addServiceMutation.isPending}
															/>
															<Input
																placeholder="Value (e.g., Web Server)"
																value={label.value}
																onChange={(e) => {
																	const newLabels = [...labels];
																	newLabels[index].value = e.target.value;
																	setLabels(newLabels);
																}}
																onPaste={(e) => handleLabelPaste(e, index)}
																disabled={addServiceMutation.isPending}
															/>
														</div>
														<Button
															type="button"
															variant="outline"
															size="icon"
															onClick={() => {
																if (labels.length > 1) {
																	setLabels(
																		labels.filter((_, i) => i !== index),
																	);
																} else {
																	setLabels([{ key: "", value: "" }]);
																}
															}}
															disabled={addServiceMutation.isPending}
															className="shrink-0"
														>
															<X className="w-4 h-4" />
														</Button>
													</div>
												))}
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() =>
														setLabels([...labels, { key: "", value: "" }])
													}
													disabled={addServiceMutation.isPending}
													className="w-full"
												>
													<Plus className="w-4 h-4 mr-2" />
													Add Label
												</Button>
											</div>

											{/* Common Labels Examples */}
											<div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
												<p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
													Common Label Examples:
												</p>
												<ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
													<li>
														<code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
															com.example.description
														</code>{" "}
														={" "}
														<code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
															My Service
														</code>{" "}
														- Service description
													</li>
													<li>
														<code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
															com.example.team
														</code>{" "}
														={" "}
														<code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
															backend
														</code>{" "}
														- Team ownership
													</li>
													<li>
														<code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
															traefik.enable
														</code>{" "}
														={" "}
														<code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
															true
														</code>{" "}
														- Enable Traefik routing
													</li>
													<li>
														<code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
															prometheus.io/scrape
														</code>{" "}
														={" "}
														<code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
															true
														</code>{" "}
														- Enable Prometheus scraping
													</li>
												</ul>
											</div>
										</div>
									</TabsContent>

									{/* Advanced Tab */}
									<TabsContent value="advanced" className="p-6 space-y-6">
										<div>
											<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
												Advanced Settings
											</h3>

											{/* Environment Variables */}
											<div className="space-y-2 mb-6">
												<Label
													htmlFor="environment"
													className="text-sm font-medium"
												>
													Environment Variables
												</Label>
												<Input
													id="environment"
													value={formData.environment}
													onChange={(e) =>
														handleInputChange("environment", e.target.value)
													}
													placeholder="NODE_ENV=production, PORT=3000"
													disabled={addServiceMutation.isPending}
												/>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													Comma-separated environment variables in format
													KEY=VALUE
												</p>
											</div>

											{/* Dependencies */}
											<div className="space-y-2 mb-6">
												<Label
													htmlFor="depends_on"
													className="text-sm font-medium"
												>
													Dependencies
												</Label>
												<Input
													id="depends_on"
													value={formData.depends_on}
													onChange={(e) =>
														handleInputChange("depends_on", e.target.value)
													}
													placeholder="database, redis"
													disabled={addServiceMutation.isPending}
												/>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													Comma-separated service names this service depends on
												</p>
											</div>

											{/* Restart Policy */}
											<div className="space-y-2 mb-6">
												<Label
													htmlFor="restart"
													className="text-sm font-medium"
												>
													Restart Policy
												</Label>
												<Input
													id="restart"
													value={formData.restart}
													onChange={(e) =>
														handleInputChange("restart", e.target.value)
													}
													placeholder="always"
													disabled={addServiceMutation.isPending}
												/>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													Restart policy: always, unless-stopped, on-failure, or
													no
												</p>
											</div>

											{/* Command */}
											<div className="space-y-2">
												<Label
													htmlFor="command"
													className="text-sm font-medium"
												>
													Command Override
												</Label>
												<Input
													id="command"
													value={formData.command}
													onChange={(e) =>
														handleInputChange("command", e.target.value)
													}
													placeholder="npm start"
													disabled={addServiceMutation.isPending}
												/>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													Override the default container command
												</p>
											</div>
										</div>
									</TabsContent>
								</Tabs>

								{error && (
									<div className="mx-6 mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
										<AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
										<div>
											<p className="text-sm font-medium text-red-900 dark:text-red-200">
												Validation Error
											</p>
											<p className="text-sm text-red-700 dark:text-red-300 mt-1">
												{error}
											</p>
										</div>
									</div>
								)}
							</div>

							{/* Bottom Action Bar */}
							<div className="mt-6 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										navigate({
											to: "/projects/$name/services",
											params: { name },
										})
									}
									disabled={addServiceMutation.isPending}
								>
									<ArrowLeft className="w-4 h-4 mr-2" />
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={addServiceMutation.isPending}
									className="bg-blue-600 hover:bg-blue-700 text-white"
								>
									{addServiceMutation.isPending ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Creating Service...
										</>
									) : (
										"Create Service"
									)}
								</Button>
							</div>
						</form>
					</div>

					{/* Sidebar */}
					<div className="lg:col-span-1">
						<div className="space-y-6">
							{/* Help Card */}
							<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
								<h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
									Docker Compose Services
								</h3>
								<p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
									Services are the containerized applications that make up your
									project. Each service runs in its own container and can be
									configured independently.
								</p>
								<div className="space-y-3">
									<div>
										<p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
											Quick Tips:
										</p>
										<ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
											<li>Use registry images for production</li>
											<li>Build contexts for custom applications</li>
											<li>Map ports to expose services</li>
											<li>Set dependencies for startup order</li>
										</ul>
									</div>
								</div>
							</div>

							{/* Project Info */}
							<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
								<h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
									Project Information
								</h3>
								<dl className="space-y-2">
									<div>
										<dt className="text-xs text-slate-500 dark:text-slate-400">
											Project Name
										</dt>
										<dd className="text-sm font-mono text-slate-900 dark:text-white">
											{name}
										</dd>
									</div>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
