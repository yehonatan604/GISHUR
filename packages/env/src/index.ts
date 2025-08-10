import { buildEnv, z } from "./core.js";
import { BaseEnvSchema } from "./envSchema.js";

export const env = buildEnv(BaseEnvSchema);

export function withServiceEnv<T extends z.ZodRawShape>(
    serviceSchema: z.ZodObject<T>
) {
    return buildEnv(BaseEnvSchema.merge(serviceSchema));
}

export { z };