import z from "zod";
import type { ServiceIdentifier } from "../types";

const ResponseSchema = z.object({
  message: z.string(),
  project: z.string(),
  service: z.string()
})

export async function postServiceStop(service: ServiceIdentifier) {
  const response = await fetch(`/api/projects/${service.projectName}/services/${service.serviceName}/stop`, { method: "POST" })
  const data = await response.json()
  console.log("stop service:", data)
  return ResponseSchema.parse(data)
}
