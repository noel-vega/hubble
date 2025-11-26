
import z from "zod"

export const ResponseSchema = z.object({
  registry: z.string(),
  repository: z.string(),
  tags: z.string().array(),
  count: z.number()
})

export async function getRepositoryTags({ repositoryName }: { repositoryName: string }) {
  const response = await fetch(`/api/registry/repositories/${repositoryName}/tags`)
  return ResponseSchema.parse(await response.json())
}
