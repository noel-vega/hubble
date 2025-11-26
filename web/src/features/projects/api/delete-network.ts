import z from "zod";
import type { NetworkIdentifier } from "../types";

const ResponseSchema = z.object({
	message: z.string(),
	project: z.string(),
	network: z.string(),
});

export async function deleteProjectNetwork(params: NetworkIdentifier) {
	const response = await fetch(
		`/api/projects/${params.projectName}/networks/${params.networkName}`,
		{
			method: "DELETE",
		},
	);

	if (!response.ok) {
		throw new Error(`Failed to delete network: ${response.statusText}`);
	}

	const data = await response.json();
	return ResponseSchema.parse(data);
}
