import { z } from "zod";
import { PortInfoSchema } from "../types";

const ContainerStateInfoSchema = z.object({
  status: z.string(),
  running: z.boolean(),
  paused: z.boolean(),
  restarting: z.boolean(),
  oom_killed: z.boolean(),
  dead: z.boolean(),
  pid: z.number(),
  exit_code: z.number(),
  error: z.string(),
  started_at: z.string(),
  finished_at: z.string(),
});

const ContainerMountInfoSchema = z.object({
  type: z.string(),
  source: z.string(),
  destination: z.string(),
  mode: z.string(),
  rw: z.boolean(),
});

const ContainerNetworkInfoSchema = z.object({
  network_id: z.string(),
  endpoint_id: z.string(),
  gateway: z.string(),
  ip_address: z.string(),
  ip_prefix_len: z.number(),
  ipv6_gateway: z.string(),
  global_ipv6_address: z.string(),
  global_ipv6_prefix_len: z.number(),
  mac_address: z.string(),
});

const ContainerPortBindingInfoSchema = z.object({
  host_ip: z.string(),
  host_port: z.string(),
});

const ContainerHostConfigInfoSchema = z.object({
  cpu_shares: z.number(),
  memory: z.number(),
  memory_reservation: z.number(),
  memory_swap: z.number(),
  nano_cpus: z.number(),
  auto_remove: z.boolean(),
  network_mode: z.string(),
  port_bindings: z.record(z.string(), ContainerPortBindingInfoSchema.array()),
});

export const DetailedContainerInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  state: ContainerStateInfoSchema,
  created: z.string(),
  ports: PortInfoSchema.array(),
  labels: z.record(z.string(), z.string()),
  mounts: ContainerMountInfoSchema.array(),
  networks: z.record(z.string(), ContainerNetworkInfoSchema),
  env: z.string().array(),
  restart_policy: z.string(),
  restart_count: z.number(),
  platform: z.string(),
  host_config: ContainerHostConfigInfoSchema,
});

export type DetailedContainerInfo = z.infer<typeof DetailedContainerInfoSchema>;

export async function getContainer({ id }: { id: string }) {
  const response = await fetch(`/api/containers/${id}`);
  const data = await response.json();
  console.log("containers", data);
  return DetailedContainerInfoSchema.parse(data);
}
