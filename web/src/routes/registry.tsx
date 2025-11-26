import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, Copy, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { fetchMe } from "@/features/auth/api/fetchMe";
import { getRepositories } from "@/features/registry/api/get-repositories";
import { getRepositoryTags } from "@/features/registry/api/get-repository-tags";

export const Route = createFileRoute("/registry")({
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
	component: RouteComponent,
});

function RouteComponent() {
	const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
	const [repoSearch, setRepoSearch] = useState("");
	const [tagSearch, setTagSearch] = useState("");
	const [copiedTag, setCopiedTag] = useState<string | null>(null);

	const repositoriesQuery = useQuery({
		queryKey: ["repositories"],
		queryFn: getRepositories,
	});

	const tagsQuery = useQuery({
		queryKey: ["repository-tags", selectedRepo],
		queryFn: () => getRepositoryTags({ repositoryName: selectedRepo! }),
		enabled: !!selectedRepo,
	});

	const filteredRepositories = useMemo(() => {
		if (!repositoriesQuery.data?.repositories) return [];
		if (!repoSearch.trim()) return repositoriesQuery.data.repositories;
		return repositoriesQuery.data.repositories.filter((repo) =>
			repo.toLowerCase().includes(repoSearch.toLowerCase()),
		);
	}, [repositoriesQuery.data?.repositories, repoSearch]);

	const filteredTags = useMemo(() => {
		if (!tagsQuery.data?.tags) return [];
		if (!tagSearch.trim()) return tagsQuery.data.tags;
		return tagsQuery.data.tags.filter((tag) =>
			tag.toLowerCase().includes(tagSearch.toLowerCase()),
		);
	}, [tagsQuery.data?.tags, tagSearch]);

	const handleCopyTag = async (tag: string) => {
		const registryHost = repositoriesQuery.data?.registry || "";
		const fullImage = registryHost
			? `${registryHost}/${selectedRepo}:${tag}`
			: `${selectedRepo}:${tag}`;
		await navigator.clipboard.writeText(fullImage);
		setCopiedTag(tag);
		setTimeout(() => setCopiedTag(null), 2000);
	};

	return (
		<div className="bg-slate-50 dark:bg-[#0d1117] min-h-screen">
			<div className="max-w-7xl mx-auto px-6 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-200px)]">
					{/* Repositories Panel */}
					<div className="lg:col-span-4 flex flex-col">
						<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl overflow-hidden flex flex-col h-full">
							<div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60">
								<div className="flex items-center gap-2 mb-3">
									<Package className="w-5 h-5 text-slate-600 dark:text-slate-400" />
									<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
										Repositories
									</h2>
									{repositoriesQuery.data && (
										<span className="text-sm text-slate-500 dark:text-slate-400">
											({repositoriesQuery.data.count})
										</span>
									)}
								</div>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
									<Input
										type="text"
										placeholder="Search repositories..."
										value={repoSearch}
										onChange={(e) => setRepoSearch(e.target.value)}
										className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
									/>
								</div>
							</div>

							<div className="flex-1 overflow-y-auto p-4">
								{repositoriesQuery.isLoading ? (
									<div className="text-center py-8">
										<p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
											Loading repositories...
										</p>
									</div>
								) : filteredRepositories.length > 0 ? (
									<div className="space-y-2">
										{filteredRepositories.map((repo) => (
											<button
												key={repo}
												onClick={() => setSelectedRepo(repo)}
												className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
													selectedRepo === repo
														? "bg-blue-500/10 border-2 border-blue-500/30 dark:border-blue-500/30"
														: "bg-slate-50 dark:bg-slate-950 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-700"
												}`}
											>
												<p className="font-medium text-slate-900 dark:text-white text-sm truncate">
													{repo}
												</p>
											</button>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<p className="text-sm text-slate-500 dark:text-slate-400">
											{repoSearch
												? "No repositories found matching your search"
												: "No repositories available"}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Tags Panel */}
					<div className="lg:col-span-8 flex flex-col">
						<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl overflow-hidden flex flex-col h-full">
							<div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60">
								<div className="flex items-center gap-2 mb-3">
									<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
										{selectedRepo
											? `Tags for: ${selectedRepo}`
											: "Select a Repository"}
									</h2>
									{tagsQuery.data && (
										<span className="text-sm text-slate-500 dark:text-slate-400">
											({tagsQuery.data.count})
										</span>
									)}
								</div>
								{selectedRepo && (
									<div className="relative">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
										<Input
											type="text"
											placeholder="Search tags..."
											value={tagSearch}
											onChange={(e) => setTagSearch(e.target.value)}
											className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
										/>
									</div>
								)}
							</div>

							<div className="flex-1 overflow-y-auto p-4">
								{!selectedRepo ? (
									<div className="flex items-center justify-center h-full">
										<div className="text-center">
											<Package className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
											<p className="text-slate-500 dark:text-slate-400">
												Select a repository to view its tags
											</p>
										</div>
									</div>
								) : tagsQuery.isLoading ? (
									<div className="text-center py-8">
										<p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
											Loading tags...
										</p>
									</div>
								) : filteredTags.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
										{filteredTags.map((tag) => (
											<button
												key={tag}
												onClick={() => handleCopyTag(tag)}
												className="group relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left"
											>
												<div className="flex items-center justify-between gap-2">
													<span className="font-mono text-sm text-slate-900 dark:text-white truncate">
														{tag}
													</span>
													{copiedTag === tag ? (
														<Check className="w-4 h-4 text-emerald-500 shrink-0" />
													) : (
														<Copy className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" />
													)}
												</div>
												<p className="text-xs text-slate-500 dark:text-slate-500 mt-1 truncate">
													{repositoriesQuery.data?.registry
														? `${repositoriesQuery.data.registry}/${selectedRepo}:${tag}`
														: `${selectedRepo}:${tag}`}
												</p>
											</button>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<p className="text-sm text-slate-500 dark:text-slate-400">
											{tagSearch
												? "No tags found matching your search"
												: "No tags available"}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
