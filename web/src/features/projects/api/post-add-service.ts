import z from "zod";
import { type ProjectComposeService } from "../types";

const ResponseSchema = z.object({
  message: z.string(),
  project: z.string(),
  service: z.string(),
});

export interface AddServiceRequest {
  projectName: string;
  service: Omit<ProjectComposeService, "status">;
}

export async function postAddService({
  projectName,
  service,
}: AddServiceRequest) {
  const response = await fetch(`/api/projects/${projectName}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(service),
  });
  const data = await response.json();
  return ResponseSchema.parse(data);
}
