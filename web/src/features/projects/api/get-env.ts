import z from "zod";
import { ProjectEnvInfoSchema } from "../types";

const ResponseSchema = z.object({
	environment: ProjectEnvInfoSchema.array(),
	count: z.number(),
});

export async function getProjectEnvironment({ name }: { name: string }) {
	const response = await fetch(`/api/projects/${name}/environment`);
	const data = await response.json();
	return ResponseSchema.parse(data);
}
