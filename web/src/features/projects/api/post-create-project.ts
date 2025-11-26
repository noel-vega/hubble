import z from "zod"
import { ProjectInfoSchema } from "../types"

export const ResponseSchema = z.object({
  message: z.string(),
  project: ProjectInfoSchema
})

export async function postCreateProject({ name }: { name: string }) {
  const response = await fetch("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name })
  })
  const data = await response.json()

  return ResponseSchema.parse(data)
}
