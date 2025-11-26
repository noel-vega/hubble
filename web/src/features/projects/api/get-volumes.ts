import z from "zod";
import { ProjectVolumeInfoSchema } from "../types";

const ResponseSchema = z.object({
	volumes: ProjectVolumeInfoSchema.array(),
	count: z.number(),
});

export async function getProjectVolumes({ name }: { name: string }) {
	const response = await fetch(`/api/projects/${name}/volumes`);
	const data = await response.json();
	return ResponseSchema.parse(data);
}
