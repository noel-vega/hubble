import z from "zod";
import type { ServiceIdentifier } from "../types";

const ResponseSchema = z.object({
	message: z.string(),
	project: z.string(),
	service: z.string(),
});

export async function deleteProjectService(service: ServiceIdentifier) {
	const response = await fetch(
		`/api/projects/${service.projectName}/services/${service.serviceName}`,
		{
			method: "DELETE",
		},
	);
	const data = await response.json();
	return ResponseSchema.parse(data);
}
