import z from "zod"

const ResponseSchema = z.object({
  message: z.string(),
  id: z.string()
})

export async function postStopContainer({ id }: { id: string }) {
  const response = await fetch(`/api/containers/${id}/stop`, {
    method: "POST",
  })
  return ResponseSchema.parse(await response.json())
}
