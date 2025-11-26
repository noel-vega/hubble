import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
	postLogin,
	PostLoginSchema,
	type PostLoginParams,
} from "@/features/auth/api/postLogin";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [authError, setAuthError] = useState<string | null>(null);

	const login = useMutation({
		mutationFn: postLogin,
		onSuccess: async () => {
			setAuthError(null);
			// Refetch the auth state to ensure it's updated
			await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
			// Navigate to projects - the route loader will use the cached data
			navigate({ to: "/projects" });
		},
		onError: (error: Error) => {
			setAuthError(error.message || "Authentication failed. Please try again.");
		},
	});

	const form = useForm<PostLoginParams>({
		resolver: zodResolver(PostLoginSchema),
		defaultValues: { username: "", password: "" },
	});

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<div className="text-6xl mb-3">🔭</div>
					<h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
						Hubble
					</h1>
					<p className="text-slate-600 dark:text-slate-400">
						Container Management Platform
					</p>
				</div>

				<div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 p-8">
					<div className="mb-6">
						<h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
							Sign in
						</h2>
						<p className="text-sm text-slate-600 dark:text-slate-400">
							Enter your credentials to access your account
						</p>
					</div>

					<form
						onSubmit={form.handleSubmit((data) => login.mutate(data))}
						className="space-y-5"
					>
						<FieldGroup>
							<Controller
								name="username"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel>Username</FieldLabel>
										<Input
											placeholder="Enter your username"
											autoComplete="username"
											disabled={login.isPending}
											{...field}
										/>
										<FieldError
											errors={fieldState.error ? [fieldState.error] : []}
										/>
									</Field>
								)}
							/>
							<Controller
								name="password"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel>Password</FieldLabel>
										<Input
											type="password"
											placeholder="Enter your password"
											autoComplete="current-password"
											disabled={login.isPending}
											{...field}
										/>
										<FieldError
											errors={fieldState.error ? [fieldState.error] : []}
										/>
									</Field>
								)}
							/>
						</FieldGroup>

						{authError && (
							<div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
								<p className="text-sm text-red-800 dark:text-red-400">
									{authError}
								</p>
							</div>
						)}

						<Button
							type="submit"
							className="w-full"
							size="lg"
							disabled={login.isPending}
						>
							{login.isPending ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Signing in...
								</>
							) : (
								"Sign in"
							)}
						</Button>
					</form>
				</div>

				<p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
					Secure container management for your infrastructure
				</p>
			</div>
		</div>
	);
}
