import z from "zod";
import { ProjectInfoSchema } from "../types";

const ProjectServiceDetailSchema = z.object({
  image: z.string(),
  ports: z.string().array(),
  environment: z.record(z.string(), z.string()),
  volumes: z.string().array(),
});

const ProjectContainerInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  service: z.string(),
  state: z.string(),
  status: z.string(),
});


// type ProjectInfo struct {
// 	Name              string `json:"name"`
// 	Path              string `json:"path"`
// 	ServiceCount      int    `json:"service_count"`
// 	ContainersRunning int    `json:"containers_running"`
// 	ContainersStopped int    `json:"containers_stopped"`
// }
//


export const ProjectDetailSchema = z.object({
  name: z.string(),
  path: z.string(),
  compose_content: z.string(),
  services: z.record(z.string(), ProjectServiceDetailSchema),
  containers: ProjectContainerInfoSchema.array(),
});

export type ProjectDetail = z.infer<typeof ProjectDetailSchema>;
export type ProjectServiceDetail = z.infer<typeof ProjectServiceDetailSchema>;
export type ProjectContainerInfo = z.infer<typeof ProjectContainerInfoSchema>;


export async function getProject({ name }: { name: string }) {
  const response = await fetch(`/api/projects/${name}`);
  const data = await response.json();
  console.log(data);
  return ProjectInfoSchema.parse(data);
}
