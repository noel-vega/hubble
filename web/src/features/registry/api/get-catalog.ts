import z from "zod"

export const RepositoryInfoSchema = z.object({
  name: z.string(),
  tags: z.string().array()
})

export const ResponseSchema = z.object({
  registry: z.string(),
  repositories: RepositoryInfoSchema.array(),
  count: z.number()
})

export async function getRegistryCatalog() {
  const response = await fetch("/api/registry/catalog")
  const data = await response.json()
  console.log("catalog", data)
  return ResponseSchema.parse(data)
}
