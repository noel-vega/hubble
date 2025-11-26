import z from "zod";
import { ProjectNetworkSchema } from "../types";


type RequestParams = {
  projectName: string;
}

const ResponseSchema = z.object({
  networks: ProjectNetworkSchema.array(),
  count: z.number()
})

export async function getProjectNetworks({ projectName }: RequestParams) {
  const response = await fetch(`/api/projects/${projectName}/networks`)
  const data = await response.json()
  return ResponseSchema.parse(data)
}
