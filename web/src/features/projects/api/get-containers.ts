import z from "zod";
import { ProjectContainerInfoSchema } from "../types";

const ResponseSchema = z.object({
	containers: ProjectContainerInfoSchema.array(),
	count: z.number(),
});

export async function getProjectContainers({ name }: { name: string }) {
	const response = await fetch(`/api/projects/${name}/containers`);
	const data = await response.json();
	return ResponseSchema.parse(data);
}
