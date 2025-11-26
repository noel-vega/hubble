import z from "zod"
import { ProjectComposeService } from "../types"

const ResponseSchema = z.object({
  services: ProjectComposeService.array(),
  count: z.number()
})

export async function getProjectServices({ name }: { name: string }) {
  const response = await fetch(`/api/projects/${name}/services`)
  const data = await response.json()
  console.log(data)
  return ResponseSchema.parse(data)
}
