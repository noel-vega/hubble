import z from "zod";

type RequestParams = {
	projectName: string;
	network: {
		name: string;
		external: boolean;
		driver?: string;
		config?: Record<string, unknown>;
	};
};

const ResponseSchema = z.object({
	message: z.string(),
	project: z.string(),
	network: z.string(),
});

export async function AddProjectNetwork({
	projectName,
	network,
}: RequestParams) {
	const response = await fetch(`/api/projects/${projectName}/networks`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(network),
	});

	if (!response.ok) {
		throw new Error(`Failed to add network: ${response.statusText}`);
	}

	const data = await response.json();
	return ResponseSchema.parse(data);
}
