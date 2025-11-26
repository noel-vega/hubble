
import { z } from 'zod'
import { ContainerInfoSchema } from '../types'

const FetchContainersResponseSchema = z.object({
  containers: ContainerInfoSchema.array(),
  count: z.number()
})

export type FetchContainersResponse = z.infer<typeof FetchContainersResponseSchema>

export const fetchContainers = async (): Promise<FetchContainersResponse> => {
  const response = await fetch("/api/containers")
  const data = await response.json()
  console.log("containers", data)
  return FetchContainersResponseSchema.parse(data)
}
