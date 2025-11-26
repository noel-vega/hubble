// r.Put("/projects/{name}/services/{service}", projectsHandler.UpdateService)

import z from "zod";
import type { ProjectComposeService } from "../types";

export interface UpdateServiceRequest {
  projectName: string;
  service: Omit<ProjectComposeService, "status">;
}

const ResponseSchema = z.object({
  message: z.string(),
  project: z.string(),
  service: z.string()
})

export async function updateProjectService({
  projectName,
  service,
}: UpdateServiceRequest) {
  const response = await fetch(
    `/api/projects/${projectName}/services/${service.name}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(service),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to update service: ${response.statusText}`);
  }

  const data = await response.json()
  return ResponseSchema.parse(data)
}
