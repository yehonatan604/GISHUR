import { BaseEnvSchema } from "@bridgepoint/zod-schemas";
import { buildEnv, z } from "./core.js";

export const env = buildEnv(BaseEnvSchema);

export const withServiceEnv = <T extends z.ZodRawShape>(
    serviceSchema: z.ZodObject<T>
) => {
    return buildEnv(BaseEnvSchema.merge(serviceSchema));
};