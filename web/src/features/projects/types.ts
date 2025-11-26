import z from "zod";

export const ProjectInfoSchema = z.object({
	name: z.string(),
	path: z.string(),
	service_count: z.number(),
	containers_running: z.number(),
	containers_stopped: z.number(),
});

export const ProjectContainerInfoSchema = z.object({
	id: z.string(),
	name: z.string(),
	service: z.string(),
	state: z.string(),
	status: z.string(),
});

export const ProjectVolumeInfoSchema = z.object({
	service: z.string(),
	volume: z.string(),
});

export const ProjectEnvInfoSchema = z.object({
	service: z.string(),
	env: z.record(z.string(), z.string()),
});

export const ProjectComposeService = z.object({
	name: z.string(),
	image: z.string(),
	build: z.string(),
	ports: z.string().array(),
	environment: z.record(z.string(), z.string()),
	volumes: z.string().array(),
	labels: z.string().array(),
	depends_on: z.string().array(),
	networks: z.string().array(),
	restart: z.string(),
	command: z.string(),
	status: z
		.literal("running")
		.or(z.literal("stopped"))
		.or(z.literal("not_created")),
});

export const ProjectNetworkSchema = z.object({
	name: z.string(),
	driver: z.string(),
	external: z.boolean().optional(),
	config: z.record(z.string(), z.unknown()),
});

export type ProjectNetwork = z.infer<typeof ProjectNetworkSchema>;

export type ProjectComposeService = z.infer<typeof ProjectComposeService>;

export type ProjectInfo = z.infer<typeof ProjectInfoSchema>;
export type ProjectContainerInfo = z.infer<typeof ProjectContainerInfoSchema>;
export type ProjectVolumeInfo = z.infer<typeof ProjectVolumeInfoSchema>;
export type ProjectEnvInfo = z.infer<typeof ProjectEnvInfoSchema>;

export const ServiceIdentifierSchema = z.object({
	projectName: z.string(),
	serviceName: z.string(),
});
export type ServiceIdentifier = z.infer<typeof ServiceIdentifierSchema>;

export const NetworkIdentifierSchema = z.object({
	projectName: z.string(),
	networkName: z.string(),
});

export type NetworkIdentifier = z.infer<typeof NetworkIdentifierSchema>;
