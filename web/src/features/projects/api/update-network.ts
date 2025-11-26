import z from "zod";

type RequestParams = {
	projectName: string;
	networkName: string;
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

export async function updateProjectNetwork(params: RequestParams) {
	const response = await fetch(
		`/api/projects/${params.projectName}/networks/${params.networkName}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params.network),
		},
	);

	if (!response.ok) {
		throw new Error(`Failed to update network: ${response.statusText}`);
	}

	const data = await response.json();
	return ResponseSchema.parse(data);
}
