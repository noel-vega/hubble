import z from "zod"

const ResponseSchema = z.object({
  content: z.string()
})
export async function getProjectDockerCompose({ name }: { name: string }) {
  const response = await fetch(`/api/projects/${name}/compose`)
  const data = await response.json()
  return ResponseSchema.parse(data)
}
