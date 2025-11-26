import z from "zod"

export const PortInfoSchema = z.object({
  private: z.number(),
  public: z.number(),
  type: z.string(),
})

export const ContainerInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  state: z.string(),
  status: z.string(),
  ports: z.array(PortInfoSchema),
  labels: z.record(z.string(), z.string()),
})

export type PortInfo = z.infer<typeof PortInfoSchema>
export type ContainerInfo = z.infer<typeof ContainerInfoSchema>
